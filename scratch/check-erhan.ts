import { db } from "../lib/db";
import { users, funds, fundContributors } from "../lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";

async function main() {
    const name = "Erhan Ayyıldız";
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2024-2025 FBIAD%')
    });
    const dbUser = await db.query.users.findFirst({
        where: ilike(users.fullName, `%${name}%`)
    });
    
    if (dbUser && fund) {
        const contribs = await db.query.fundContributors.findMany({
            where: and(eq(fundContributors.fundId, fund.id), eq(fundContributors.userId, dbUser.id))
        });
        console.log("Erhan Ayyıldız contributions to 2024-2025:", contribs);
    }
    process.exit(0);
}
main();
