import { db } from "../lib/db";
import { payments } from "../lib/db/schema";
import { isNull, eq, and } from "drizzle-orm";

async function main() {
    const unknown = await db.select().from(payments).where(and(isNull(payments.userId), eq(payments.status, 'completed'))).limit(5);
    console.log(JSON.stringify(unknown, null, 2));
    process.exit(0);
}
main().catch(console.error);
