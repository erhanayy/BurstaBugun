import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { isNull, eq } from "drizzle-orm";

async function main() {
    const unknownPayments = await db.select({
        id: payments.id,
        ownerId: funds.ownerId
    })
    .from(payments)
    .leftJoin(funds, eq(funds.id, payments.fundId))
    .where(isNull(payments.userId));
    
    for (const p of unknownPayments) {
        if (p.ownerId) {
            await db.update(payments)
                .set({ userId: p.ownerId })
                .where(eq(payments.id, p.id));
        }
    }
    
    console.log(`Kalan null'lar onarıldı.`);
    process.exit(0);
}
main().catch(console.error);
