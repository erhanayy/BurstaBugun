import { db } from "../lib/db";
import { donations, payments } from "../lib/db/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
    // Tüm başarılı bağışlar
    const completedDonations = await db.select().from(donations).where(eq(donations.status, 'completed'));
    
    // Payments tablosunda donationId si olmayanlar
    const allPayments = await db.select().from(payments);
    
    console.log(`Tamamlanmış Bağış Sayısı: ${completedDonations.length}`);
    console.log(`Toplam Payment Sayısı: ${allPayments.length}`);
    
    // Bakalım eşleşen var mı amount ve paymentDate üzerinden?
    let matched = 0;
    for (const d of completedDonations) {
        const p = allPayments.find(p => p.amount === d.amount && Math.abs(p.paymentDate.getTime() - d.createdAt.getTime()) < 60000);
        if (p) {
            matched++;
            // Update payment to link back to donation
            await db.update(payments).set({ donationId: d.id }).where(eq(payments.id, p.id));
        }
    }
    
    console.log(`Bağlanabilecek Tahmini Ödeme Sayısı: ${matched}`);
    process.exit(0);
}
main().catch(console.error);
