import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const seasons = await db.query.parametersTenantSeasons.findMany();
    console.log("Seasons:", seasons.map(s => ({ id: s.id, period: s.period, tenantId: s.tenantId })));
    process.exit(0);
}
main();
