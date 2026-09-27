import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const s = await db.query.parametersTenantSeasons.findMany();
    console.log(s);
    process.exit(0);
}
main();
