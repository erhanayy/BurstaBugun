import { db } from "../lib/db";
import { payments, users } from "../lib/db/schema";
import { eq, ilike, and, desc } from "drizzle-orm";

async function main() {
    const erhan = await db.select().from(users).where(ilike(users.fullName, '%Erhan Ayyıldız%')).limit(1);
    if (erhan.length > 0) {
        const erhanId = erhan[0].id;
        const pays = await db.select().from(payments)
            .where(and(eq(payments.userId, erhanId), eq(payments.status, 'completed')))
            .orderBy(desc(payments.amount));
        console.log(`Erhan Ayyıldız'ın (userId dolu olan) COMPLETED ödemeleri: ${pays.length}`);
        
        pays.forEach(p => console.log(`${p.amount} TL - Durum: ${p.status} - Not: ${p.notes}`));
        
        // Let's also check if there are any pending ones that shouldn't show up
        const paysPending = await db.select().from(payments).where(and(eq(payments.userId, erhanId), eq(payments.status, 'pending')));
        console.log(`Erhan Ayyıldız'ın PENDING ödemeleri: ${paysPending.length}`);
    }
    process.exit(0);
}
main().catch(console.error);
