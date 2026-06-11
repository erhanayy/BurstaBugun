import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";

async function main() {
    const seasons = await db.query.parametersTenantSeasons.findMany();
    console.log(JSON.stringify(seasons, null, 2));
    process.exit(0);
}
main();
