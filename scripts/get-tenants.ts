import { db } from '../lib/db';
import { tenants } from '../lib/db/schema';

async function main() {
    console.log("Fetching tenants...");
    const allTenants = await db.select().from(tenants);
    console.log(allTenants.map(t => ({ id: t.id, name: t.shortName })));
    process.exit(0);
}

main().catch(console.error);
