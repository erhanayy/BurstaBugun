import { db } from './lib/db';
import { payments } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const p = await db.query.payments.findMany({
        where: eq(payments.fundId, 'fb900ba8-c48f-44fe-8576-92638708978b')
    });
    console.log(p.map(x => ({ id: x.id, status: x.status, userId: x.userId, amount: x.amount, fundId: x.fundId })));
    process.exit(0);
}
main().catch(console.error);
