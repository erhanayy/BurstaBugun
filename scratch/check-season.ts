import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { desc } from "drizzle-orm";

async function run() {
    try {
        const activeSeasonParam = await db.query.parametersTenantSeasons.findFirst({
            // where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
            orderBy: [desc(parametersTenantSeasons.isActive), desc(parametersTenantSeasons.seasonStartDate)]
        });
        console.log("Found season:", activeSeasonParam?.period, "IsActive:", activeSeasonParam?.isActive);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
