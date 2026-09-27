import { db } from "../lib/db";
import { users, funds, fundContributors } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const name = "Erhan";
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2024-2025 FBIAD%')
    });
    
    const dbUsers = await db.query.users.findMany({
        where: ilike(users.fullName, `%${name}%`)
    });
    
    for (const u of dbUsers) {
        console.log(`User: ${u.fullName} (${u.id})`);
        const contribs = await db.query.fundContributors.findMany({
            where: eq(fundContributors.userId, u.id)
        });
        
        for (const c of contribs) {
            if (c.fundId === fund.id) {
                console.log(`  -> Contrib in 2024-2025: amount=${c.amount}, count=${c.studentCount}`);
            }
        }
    }
    process.exit(0);
}
main();
