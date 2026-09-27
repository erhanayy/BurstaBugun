import { db } from "../lib/db";
import { funds } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const dummyId = '8d4a14e5-a064-4e79-812b-1a6d56ba0917';
    const fs = await db.query.funds.findMany({
        where: eq(funds.ownerId, dummyId)
    });
    console.log(fs);
    process.exit(0);
}
main();
