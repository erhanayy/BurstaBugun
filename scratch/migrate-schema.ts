import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    await db.execute(sql`ALTER TABLE pledge_transactions RENAME COLUMN allocated_student_count TO allocated_amount;`);
    console.log("Column renamed successfully.");
    process.exit(0);
}
main().catch(console.error);
