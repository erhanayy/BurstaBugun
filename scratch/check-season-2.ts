import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const seasons = await db.query.parametersTenantSeasons.findMany();
        console.log("Seasons:", seasons.map(s => ({ period: s.period, isActive: s.isActive, startDate: s.seasonStartDate })));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
