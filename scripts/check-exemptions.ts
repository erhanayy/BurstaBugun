import { db } from '../lib/db';
import { applications } from '../lib/db/schema';
import { eq, inArray, and } from 'drizzle-orm';

async function main() {
    const requests = await db.query.applications.findMany({
        where: eq(applications.isExemptionRequested, true),
        with: {
            user: true
        }
    });
    console.log(JSON.stringify(requests, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
