import { db } from "./lib/db";
import { payments } from "./lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
async function run() {
    const fundPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.fundId, '7aec695c-472d-4eb5-956e-f0751fd75b95'),
            eq(payments.status, 'pending')
        ),
        orderBy: [asc(payments.paymentDate)]
    });
    console.log(fundPayments.map(p => p.paymentDate));
}
run();
