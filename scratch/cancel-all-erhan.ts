import { db } from "../lib/db";
import { payments, users, pledgeTransactions } from "../lib/db/schema";
import { eq, ilike, isNull } from "drizzle-orm";

async function main() {
    const erhanUsers = await db.select().from(users).where(ilike(users.fullName, '%Erhan Ayyıldız%'));
    let cancelled = 0;
    
    for (const u of erhanUsers) {
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
    
    console.log(`Erhan Ayyıldız'a ait ${cancelled} adet tüm eşleşmemiş ödeme cancelled yapıldı.`);
    process.exit(0);
}
main().catch(console.error);
