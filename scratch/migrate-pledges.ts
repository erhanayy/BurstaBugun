import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    await db.execute(sql`DELETE FROM pledge_transactions;`);
    console.log("Pledge transactions cleared.");
    process.exit(0);
}
main().catch(console.error);
