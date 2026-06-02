import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, funds, fundContributors } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET || 'fbiad-webhook-secret-key-123'}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { fundId, transactionId, paymentIds } = await request.json();

    if (!fundId) {
      return NextResponse.json({ success: false, error: 'fundId gerekli' }, { status: 400 });
    }

    if (paymentIds && Array.isArray(paymentIds) && paymentIds.length > 0) {
      // Sadece gönderilen ödeme ID'lerini tamamlandı olarak işaretle
      await db.update(payments)
        .set({ 
          status: 'completed',
          notes: transactionId ? `Web Sanal POS ile ödendi. İşlem No: ${transactionId}` : 'Web üzerinden ödendi',
          updatedAt: new Date()
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
          notes: transactionId ? `Web Sanal POS ile (Tüm Kalan) ödendi. İşlem No: ${transactionId}` : 'Web üzerinden (Tüm Kalan) ödendi',
          updatedAt: new Date()
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook Payment Complete Error:", error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
