import { db } from "../lib/db";
import { funds, fundContributors } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const fs = await db.query.funds.findMany({
        where: ilike(funds.title, '%FBIAD%')
    });
    
    for (const f of fs) {
        console.log(`Fund: ${f.title}`);
        const c = await db.query.fundContributors.findMany({
            where: eq(fundContributors.fundId, f.id),
            with: { user: true }
        });
        
        for (const contrib of c) {
            if (contrib.user.fullName.includes("Erhan")) {
                console.log(`  Erhan Contrib: ${contrib.studentCount} students, ${contrib.amount} TL. ID: ${contrib.id}`);
            }
        }
    }
    process.exit(0);
}
main();
