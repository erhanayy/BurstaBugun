import { db } from "../lib/db";
import { users, funds, fundContributors, payments } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2024-2025 FBIAD%')
    });
    
    // Find contrib for amount 2500, count 50
    const testContribs = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fund.id)
    });
    
    for (const c of testContribs) {
        if (c.studentCount === 50 && c.amount === 2500) {
            console.log("Found test contrib to delete:", c.id);
            await db.delete(fundContributors).where(eq(fundContributors.id, c.id));
        }
    }
    
    const testPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, fund.id)
    });
    
    for (const p of testPayments) {
        if (p.amount === 2500) {
            console.log("Found test payment to delete:", p.id);
            await db.delete(payments).where(eq(payments.id, p.id));
        }
    }

    process.exit(0);
}
main();
