import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const activeSeasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.isActive, true)
    });
    console.log("All active seasons:", activeSeasons.map(s => s.period));
    process.exit(0);
}
main();
