import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, funds, fundContributors, mokaTokens } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET || 'fbiad-webhook-secret-key-123'}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const payload = await request.json();
    console.log("PAYMENT COMPLETE WEBHOOK RECEIVED:", JSON.stringify(payload));
    const { fundId, transactionId, paymentIds, userId, tokenCode, paymentMethod, receiptUrl } = payload;

    const isWireTransfer = paymentMethod === 'wire_transfer';
    console.log(`WEBHOOK DEBUG: paymentMethod="${paymentMethod}", isWireTransfer=${isWireTransfer}, type=${typeof paymentMethod}`);

    if (!fundId) {
      return NextResponse.json({ success: false, error: 'fundId gerekli' }, { status: 400 });
    }

    let finalPaymentIds: string[] = [];
    if (paymentIds && Array.isArray(paymentIds) && paymentIds.length > 0) {
      paymentIds.forEach((pid: string) => {
          if (pid.includes(',')) {
              finalPaymentIds.push(...pid.split(','));
          } else {
              finalPaymentIds.push(pid);
          }
      });
    }

    if (finalPaymentIds.length > 0) {
      const isSubscription = paymentMethod === 'subscription';
      const statusToSet = isWireTransfer ? 'pending' : 'completed';

      // Mark the selected payments
      const updatedPayments = await db.update(payments)
        .set({ 
          status: statusToSet,
          receiptUrl: receiptUrl || null,
          paymentMethod: isSubscription ? 'subscription' : (isWireTransfer ? 'wire_transfer' : undefined),
          notes: isWireTransfer 
            ? `Havale/EFT dekontu yüklendi. Onay bekliyor. İşlem No: ${transactionId}` 
            : (transactionId ? `Web Sanal POS ile ${isSubscription ? '(Aylık Abonelik İlk Taksit)' : 'ödendi'}. İşlem No: ${transactionId}` : 'Web üzerinden ödendi')
        })
        .where(inArray(payments.id, finalPaymentIds))
        .returning();

      // IF COMPLETED, increment the fund's collectedAmount
      if (statusToSet === 'completed') {
         const totalPaid = updatedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
         if (totalPaid > 0) {
            await db.update(funds)
              .set({ collectedAmount: sql`${funds.collectedAmount} + ${totalPaid}` })
              .where(eq(funds.id, fundId));
         }
      }
    }

    if (isWireTransfer) {
      return NextResponse.json({ success: true, message: 'Dekont alındı, onay bekleniyor.' });
    }

    // Katılımcıları (Contributor) ödedi olarak işaretle
    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });

    if (fund && userId) {
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
