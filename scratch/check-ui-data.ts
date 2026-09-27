import { db } from "../lib/db";
import { payments, users, pledgeTransactions } from "../lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";

async function main() {
    // Exact same query as the UI
    const unmatched = await db.select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        notes: payments.notes,
        fullName: users.fullName
    })
    .from(payments)
    .leftJoin(pledgeTransactions, eq(pledgeTransactions.paymentId, payments.id))
    .leftJoin(users, eq(users.id, payments.userId))
    .where(
        and(
            eq(payments.tenantId, 'cfc00202-11c1-48dd-ae63-35fd44c60977'), // assuming this is the tenant
            eq(payments.status, 'completed'),
            isNull(pledgeTransactions.id)
        )
    )
    .orderBy(desc(payments.createdAt));
    
    console.log(`UI Sorgusu Sonucu Dönen Kayıt: ${unmatched.length}`);
    unmatched.slice(0, 10).forEach(u => console.log(`${u.fullName}: ${u.amount} TL - Durum: ${u.status} - Not: ${u.notes}`));
    process.exit(0);
}
main().catch(console.error);
