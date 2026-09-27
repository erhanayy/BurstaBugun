import { db } from "../lib/db";
import { parametersTenantSeasons, funds } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    // get first active season for any tenant
    const activeSeason = await db.query.parametersTenantSeasons.findFirst({
        where: eq(parametersTenantSeasons.isActive, true)
    });
    console.log("Active season:", activeSeason);

    if (activeSeason) {
        const activeFunds = await db.query.funds.findMany({
            where: and(
                eq(funds.tenantId, activeSeason.tenantId),
                eq(funds.period, activeSeason.id),
                eq(funds.isActive, true),
                eq(funds.publishOnWebsite, true)
            )
        });
        console.log("Active funds in active season:", activeFunds.length);
        
        // Also check if there are ANY funds in this season, regardless of isActive
        const allFundsInSeason = await db.query.funds.findMany({
            where: and(
                eq(funds.tenantId, activeSeason.tenantId),
                eq(funds.period, activeSeason.id)
            )
        });
        console.log("ALL funds in active season:", allFundsInSeason.length);
    }
    process.exit(0);
}
main();
