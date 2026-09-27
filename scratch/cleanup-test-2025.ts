import { db } from "../lib/db";
import { users, funds, fundContributors, payments } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2025-2026 FBIAD%')
    });
    
    const contribToDeleteId = 'b1f9195f-d679-4cc8-9d0d-78c1365da7cd';
    
    await db.delete(fundContributors).where(eq(fundContributors.id, contribToDeleteId));
    console.log("Deleted test contrib 67/4000 for 2025-2026.");
    
    const testPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, fund.id)
    });
    
    for (const p of testPayments) {
        if (p.amount === 4000) {
            console.log("Found test payment to delete:", p.id);
            await db.delete(payments).where(eq(payments.id, p.id));
        }
    }

    process.exit(0);
}
main();
