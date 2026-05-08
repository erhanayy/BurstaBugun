import { db } from './lib/db';
import { tenants } from './lib/db/schema';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        const res = await db.select().from(tenants);
        console.log("Success:", res.length, "tenants found.");
        process.exit(0);
    } catch (e: any) {
        console.error("DB Error:", e.message);
        process.exit(1);
    }
}
test();
