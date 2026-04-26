import { db } from "../lib/db";
import { funds, fundSelections } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allFunds = await db.query.funds.findMany();
    for (const f of allFunds) {
        console.log(`Fund: ${f.title}`);
        console.log(`- ID: ${f.id}`);
        console.log(`- targetStudentCount: ${f.targetStudentCount}`);

        const sels = await db.query.fundSelections.findMany({
            where: eq(fundSelections.fundId, f.id)
        });
        console.log(`- Current Selections Count in DB: ${sels.length}`);
    }
    process.exit(0);
}
main();
