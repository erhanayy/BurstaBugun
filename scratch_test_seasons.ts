import { db } from "./lib/db";
async function run() {
    const s = await db.query.parametersTenantSeasons.findMany();
    console.log(s);
}
run();
