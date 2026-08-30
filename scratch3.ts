import { db } from "./lib/db";
import { payments } from "./lib/db/schema";
import { eq } from "drizzle-orm";
async function run() {
    const p = await db.query.payments.findMany({
        where: eq(payments.fundId, '7aec695c-472d-4eb5-956e-f0751fd75b95')
    });
    console.log(p.length, p[0]);
}
run();
