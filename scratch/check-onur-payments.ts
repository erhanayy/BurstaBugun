import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const onurUsers = await db.select().from(users).where(ilike(users.fullName, '%Onur Kırcalı%'));
    if (onurUsers.length > 0) {
        const onurFunds = await db.select().from(funds).where(eq(funds.ownerId, onurUsers[0].id));
        for (const f of onurFunds) {
            const p = await db.select().from(payments).where(eq(payments.fundId, f.id));
            p.forEach(pay => {
                console.log(`- Tutar: ${pay.amount}, Durum: ${pay.status}, Tarih: ${pay.paymentDate?.toISOString()}, Not: ${pay.notes}`);
            });
        }
    }
    process.exit(0);
}
main().catch(console.error);
