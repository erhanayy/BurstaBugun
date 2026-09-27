import { db } from "../lib/db";
import { payments, users } from "../lib/db/schema";
import { ilike, eq, asc } from "drizzle-orm";

async function main() {
    const ufukUser = await db.select().from(users).where(ilike(users.fullName, '%Ufuk Işık%'));
    if (ufukUser.length > 0) {
        const ufukPayments = await db.select().from(payments)
            .where(eq(payments.userId, ufukUser[0].id))
            .orderBy(asc(payments.paymentDate));
        
        console.log(`Bulunan ödeme sayısı: ${ufukPayments.length}`);
        
        if (ufukPayments.length > 0) {
            const firstPayment = ufukPayments[0];
            const remainingPayments = ufukPayments.slice(1);
            
            console.log(`İlk ödeme (completed kalacak): ${firstPayment.paymentDate} - ${firstPayment.amount} TL`);
            console.log(`${remainingPayments.length} adet ödeme pending yapılacak...`);
            
            for (const payment of remainingPayments) {
                await db.update(payments)
                    .set({ status: 'pending' })
                    .where(eq(payments.id, payment.id));
            }
            
            console.log("İşlem tamamlandı!");
        }
    } else {
        console.log("Ufuk Işık bulunamadı.");
    }
    process.exit(0);
}
main().catch(console.error);
