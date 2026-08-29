import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, funds, fundContributors, fundSelections, mokaTokens, applications } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createNotification } from '@/lib/actions/notification';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET || 'fbiad-webhook-secret-key-123'}`;

    if (authHeader !== expectedToken) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const payload = await request.json();
    console.log("PAYMENT COMPLETE WEBHOOK RECEIVED:", JSON.stringify(payload));
    const { fundId, transactionId, paymentIds, count, userId, tokenCode, paymentMethod, receiptUrl } = payload;

    const isWireTransfer = paymentMethod === 'wire_transfer';

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
      const isOwner = fund?.ownerId === userId;
      const myAppIds = stableSelections
          .filter((s: any) => s.sponsorId === userId || (!s.sponsorId && isOwner))
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
        const isSubscription = paymentMethod === 'subscription';
        
        await db.update(payments)
          .set({ 
            status: isWireTransfer ? 'pending' : 'completed',
            receiptUrl: receiptUrl || null,
            paymentMethod: isSubscription ? 'subscription' : (isWireTransfer ? 'wire_transfer' : undefined),
            notes: isWireTransfer 
              ? `Havale/EFT dekontu yüklendi. Onay bekliyor. İşlem No: ${transactionId}` 
              : (transactionId ? `Web Sanal POS ile ${isSubscription ? '(Aylık Abonelik İlk Taksit)' : 'ödendi'}. İşlem No: ${transactionId}` : 'Web üzerinden ödendi')
          })
          .where(inArray(payments.id, paymentsToMark));

        // Update the REST of the pending payments for this user's apps to have paymentMethod = 'subscription'
        if (isSubscription && myPendingPayments.length > count) {
             const restIds = myPendingPayments.slice(count).map(p => p.id);
             await db.update(payments)
               .set({ paymentMethod: 'subscription' })
               .where(inArray(payments.id, restIds));
        }
      }
    } else if (paymentIds && Array.isArray(paymentIds) && paymentIds.length > 0) {
      // Geriye dönük uyumluluk: Sadece gönderilen ödeme ID'lerini tamamlandı olarak işaretle
      await db.update(payments)
        .set({ 
          status: isWireTransfer ? 'pending' : 'completed',
          receiptUrl: receiptUrl || null,
          notes: isWireTransfer 
            ? `Havale/EFT dekontu yüklendi. Onay bekliyor. İşlem No: ${transactionId}` 
            : (transactionId ? `Web Sanal POS ile ödendi. İşlem No: ${transactionId}` : 'Web üzerinden ödendi')
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
      const allPendingPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.fundId, fundId),
            eq(payments.status, 'pending')
        ),
        orderBy: (p, { asc }) => [asc(p.paymentDate)]
      });

      if (allPendingPayments.length > 0) {
          const isSubscription = paymentMethod === 'subscription';
          // If it's a subscription, only mark the FIRST payment as completed
          const paymentsToUpdate = isSubscription ? [allPendingPayments[0]] : allPendingPayments;

          await db.update(payments)
            .set({ 
              status: isWireTransfer ? 'pending' : 'completed',
              receiptUrl: receiptUrl || null,
              paymentMethod: isSubscription ? 'subscription' : 'wire_transfer',
              notes: isWireTransfer 
                ? `Havale/EFT dekontu yüklendi. Onay bekliyor. İşlem No: ${transactionId}` 
                : (transactionId ? `Web Sanal POS ile ${isSubscription ? '(Aylık Abonelik İlk Taksit)' : '(Tüm Kalan)'} ödendi. İşlem No: ${transactionId}` : `Web üzerinden ${isSubscription ? '(Aylık Abonelik)' : '(Tüm Kalan)'} ödendi`)
            })
            .where(
              inArray(payments.id, paymentsToUpdate.map(p => p.id))
            );

          // Update the REST of the pending payments for this fund to have paymentMethod = 'subscription'
          if (isSubscription && allPendingPayments.length > 1) {
             const restIds = allPendingPayments.slice(1).map(p => p.id);
             await db.update(payments)
               .set({ paymentMethod: 'subscription' })
               .where(inArray(payments.id, restIds));
          }
      }
    }

    if (isWireTransfer) {
      return NextResponse.json({ success: true, message: 'Dekont alındı, onay bekleniyor.' });
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

        // ACTIVATE APPLICATIONS AND NOTIFY STUDENTS GLOBALLY FOR THIS FUND
        const appsToActivate = await db.query.applications.findMany({
            where: and(
                eq(applications.fundId, fundId),
                eq(applications.status, 'selected')
            )
        });

        if (appsToActivate.length > 0) {
            await db.update(applications)
              .set({ status: 'active' })
              .where(and(eq(applications.fundId, fundId), eq(applications.status, 'selected')));

            for (const app of appsToActivate) {
               await createNotification(
                  app.tenantId,
                  [app.userId],
                  'application',
                  'Tebrikler! Bursa Seçildiniz 🎉',
                  `Başvurunuz onaylandı ve bir burs fonuna atandınız. İlk tahsilat başarıyla yapıldı. Öğrenim döneminiz boyunca ödemeleriniz gerçekleşecektir.`
               ).catch(e => console.error("Notification failed", e));
            }
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
