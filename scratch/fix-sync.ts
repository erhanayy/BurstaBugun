import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        await db.update(parametersTenantSeasons)
            .set({ seasonStartDate: new Date("2025-08-01") })
            .where(eq(parametersTenantSeasons.period, "2025-2026"));
            
        await db.update(parametersTenantSeasons)
            .set({ seasonStartDate: new Date("2026-08-01") })
            .where(eq(parametersTenantSeasons.period, "2026-2027"));
            
        console.log("Updated dates!");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
