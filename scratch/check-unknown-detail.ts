import { db } from "../lib/db";
import { payments } from "../lib/db/schema";
import { isNull } from "drizzle-orm";

async function main() {
    const unknown = await db.select().from(payments).where(isNull(payments.userId)).limit(5);
    console.log(JSON.stringify(unknown, null, 2));
    process.exit(0);
}
main().catch(console.error);
