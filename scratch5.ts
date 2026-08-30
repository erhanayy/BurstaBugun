import { db } from "./lib/db";
import { fundSelections } from "./lib/db/schema";
import { eq } from "drizzle-orm";
async function run() {
    const s = await db.query.fundSelections.findMany({
        where: eq(fundSelections.fundId, '7aec695c-472d-4eb5-956e-f0751fd75b95')
    });
    console.log(s);
}
run();
