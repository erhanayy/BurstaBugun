import { db } from "../lib/db";
import { payments, users, pledgeTransactions } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const testUsers = await db.select().from(users).where(ilike(users.fullName, '%Test Öğrenci 1%'));
    let cancelled = 0;
    
    for (const u of testUsers) {
        // Only cancel unmatched ones
        const unmatched = await db.select({
            id: payments.id
        })
        .from(payments)
        .leftJoin(pledgeTransactions, eq(pledgeTransactions.paymentId, payments.id))
        .where(
            eq(payments.userId, u.id)
        );
        
        for (const p of unmatched) {
            await db.update(payments)
                .set({ status: 'cancelled' })
                .where(eq(payments.id, p.id));
            cancelled++;
        }
    }
    
    console.log(`Test Öğrenci 1 adına ait ${cancelled} adet eşleşmemiş ödeme cancelled yapıldı.`);
    process.exit(0);
}
main().catch(console.error);
