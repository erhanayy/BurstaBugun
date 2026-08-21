import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, funds, fundContributors, fundSelections, mokaTokens } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET || 'fbiad-webhook-secret-key-123'}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { fundId, transactionId, paymentIds, count, userId, tokenCode, paymentMethod } = await request.json();

    if (!fundId) {
      return NextResponse.json({ success: false, error: 'fundId gerekli' }, { status: 400 });
    }

    if (count && userId) {
      // Find the user's explicit selections
      const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId),
        with: { selections: { where: eq(fundSelections.isActive, true) } } // Assuming selections exist, fallback to general if needed
      });
      
      const stableSelections = [...(fund?.selections || [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const myAppIds = stableSelections
          .filter((s: any) => s.sponsorId === userId)
          .map((s: any) => s.applicationId);

      // Find all pending payments for this fund
      const fundPayments = await db.query.payments.findMany({
        where: and(
          eq(payments.fundId, fundId),
          eq(payments.status, 'pending')
        ),
        orderBy: [payments.paymentDate]
      });

      // Filter to just this user's payments
      const myPendingPayments = myAppIds.length > 0 
          ? fundPayments.filter(p => myAppIds.includes(p.applicationId))
          : fundPayments; // Fallback if no specific apps (e.g. general contributor)

      // Take only the first `count` items
      const paymentsToMark = myPendingPayments.slice(0, count).map(p => p.id);

      if (paymentsToMark.length > 0) {
        await db.update(payments)
          .set({ 
            status: 'completed',
            notes: transactionId ? `Web Sanal POS ile ödendi. İşlem No: ${transactionId}` : 'Web üzerinden ödendi'
          })
          .where(inArray(payments.id, paymentsToMark));
      }
    } else if (paymentIds && Array.isArray(paymentIds) && paymentIds.length > 0) {
      // Geriye dönük uyumluluk: Sadece gönderilen ödeme ID'lerini tamamlandı olarak işaretle
      await db.update(payments)
        .set({ 
          status: 'completed',
          notes: transactionId ? `Web Sanal POS ile ödendi. İşlem No: ${transactionId}` : 'Web üzerinden ödendi'
        })
        .where(
          and(
            eq(payments.fundId, fundId),
            eq(payments.status, 'pending'),
            inArray(payments.id, paymentIds)
          )
        );
    } else {
      // Fallback: eski sistem çalışıyorsa veya tüm fon ödeniyorsa
      await db.update(payments)
        .set({ 
          status: 'completed',
          notes: transactionId ? `Web Sanal POS ile (Tüm Kalan) ödendi. İşlem No: ${transactionId}` : 'Web üzerinden (Tüm Kalan) ödendi'
        })
        .where(
          and(
            eq(payments.fundId, fundId),
            eq(payments.status, 'pending')
          )
        );
    }

    // Ayrıca, fonun ödemesi yapıldığı için katılımcıları da onaylı (isPaid=true) hale getir
    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });

    if (fund) {
        const contributors = await db.query.fundContributors.findMany({
            where: eq(fundContributors.fundId, fundId)
        });

        if (contributors.length > 0) {
            await db.update(fundContributors)
                .set({ isPaid: true })
                .where(eq(fundContributors.fundId, fundId));
        } else {
            // Eğer henüz bir contributor kaydı yoksa, ödemeyi yapanın (veya fon sahibinin) kaydını oluştur
            await db.insert(fundContributors).values({
                fundId: fundId,
                userId: fund.ownerId,
                amount: 0,
                isPaid: true
            });
        }
    }

    // Save Moka Token if provided
    if (tokenCode && userId) {
        await db.insert(mokaTokens).values({
            userId: userId,
            tokenCode: tokenCode,
            cardMask: null // Moka might not return this, so we leave it null for now
        });
        console.log(`Saved Moka token for user ${userId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook Payment Complete Error:", error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
