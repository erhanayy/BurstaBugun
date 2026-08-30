import { db } from "./lib/db";
import { payments } from "./lib/db/schema";
import { eq, asc } from "drizzle-orm";
async function run() {
    const p = await db.query.payments.findMany({
        where: eq(payments.fundId, '7aec695c-472d-4eb5-956e-f0751fd75b95'),
        orderBy: [asc(payments.paymentDate), asc(payments.createdAt)]
    });
    console.log(p.slice(0, 5).map(x => ({ app: x.applicationId, date: x.paymentDate, amount: x.amount })));
}
run();
