import { db } from "../lib/db";
import { donations, payments, funds, fundContributors } from "../lib/db/schema";
import { pledgeTransactions } from "../lib/db/pledge-schema";
import { ilike, eq, and } from "drizzle-orm";

async function main() {
    const ahmetDonation = await db.query.donations.findFirst({
        where: ilike(donations.donorEmail, '%ahmetnuriciger%')
    });
    
    if (!ahmetDonation || ahmetDonation.status !== 'completed' || !ahmetDonation.fundId) {
        console.log("Revert işlemine uygun kayıt bulunamadı.");
        process.exit(0);
    }
    
    const fundId = ahmetDonation.fundId;
    
    // 1. Payment kaydını bul
    const linkedPayment = await db.query.payments.findFirst({
        where: eq(payments.donationId, ahmetDonation.id)
    });
    
    if (linkedPayment) {
        const userId = linkedPayment.userId;
        
        // 1.5 Pledge Transaction'ları temizle
        await db.delete(pledgeTransactions).where(eq(pledgeTransactions.paymentId, linkedPayment.id));
        console.log("Bağlı pledge transaction'lar temizlendi.");
        
        // 2. fundContributors bakiye düş
        if (userId) {
            const contributor = await db.query.fundContributors.findFirst({
                where: and(eq(fundContributors.fundId, fundId), eq(fundContributors.userId, userId))
            });
            if (contributor) {
                await db.update(fundContributors)
                    .set({ amount: contributor.amount - linkedPayment.amount })
                    .where(eq(fundContributors.id, contributor.id));
                console.log(`Contributor bakiyesi düşüldü (-${linkedPayment.amount})`);
            }
        }
        
        // 3. Payment sil
        await db.delete(payments).where(eq(payments.id, linkedPayment.id));
        console.log("Hatalı payment silindi.");
    }
    
    // 4. Fund bakiye düş
    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });
    if (fund) {
        await db.update(funds)
            .set({ collectedAmount: fund.collectedAmount - ahmetDonation.amount })
            .where(eq(funds.id, fund.id));
        console.log(`Fon bakiyesi düşüldü (-${ahmetDonation.amount})`);
    }
    
    // 5. Donation geri al
    await db.update(donations)
        .set({ status: 'pending' as any, fundId: null })
        .where(eq(donations.id, ahmetDonation.id));
        
    console.log("Bağış tekrar Onay Bekliyor statüsüne çekildi.");
    
    process.exit(0);
}
main().catch(console.error);
