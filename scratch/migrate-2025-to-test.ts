import { db } from "../lib/db";
import { funds, applications } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const oldSeasonId = 'b22c682a-546b-4cbf-acdd-d432e9110cb6'; // 2025-2026
    const newSeasonId = '6718c3f4-a2a1-4959-847a-00ce71a954e5'; // Test Dönemi

    // Update funds
    const fundsUpdate = await db.update(funds)
        .set({ period: newSeasonId })
        .where(eq(funds.period, oldSeasonId));
    
    console.log("Funds updated.");

    // Update applications
    const appsUpdate = await db.update(applications)
        .set({ period: newSeasonId })
        .where(eq(applications.period, oldSeasonId));
    
    console.log("Applications updated.");
    process.exit(0);
}
main();
