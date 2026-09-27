import { db } from "../lib/db";
import { payments } from "../lib/db/schema";
import { isNull } from "drizzle-orm";

async function main() {
    const remaining = await db.select().from(payments).where(isNull(payments.userId));
    console.log(`Kalan null userId sayısı: ${remaining.length}`);
    process.exit(0);
}
main().catch(console.error);
