import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    try {
        console.log("Dropping system_parameters...");
        await db.execute(sql`DROP TABLE system_parameters CASCADE;`);
        console.log("Dropped system_parameters.");
        process.exit(0);
    } catch(e: any) {
        console.error("Error full:", e);
        process.exit(1);
    }
}
run();
