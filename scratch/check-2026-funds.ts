import { db } from "../lib/db";
import { parametersTenantSeasons, funds } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    const activeSeasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.isActive, true)
    });
    const s2026 = activeSeasons.find(s => s.period === '2026-2027');
    if (s2026) {
        const allFundsInSeason = await db.query.funds.findMany({
            where: and(
                eq(funds.tenantId, s2026.tenantId),
                eq(funds.period, s2026.id)
            )
        });
        console.log("ALL funds in 2026-2027:", allFundsInSeason.length);
        
        const publishedFunds = allFundsInSeason.filter(f => f.publishOnWebsite && f.isActive);
        console.log("Published & Active funds in 2026-2027:", publishedFunds.length);
    }
    process.exit(0);
}
main();
