import { db } from "../lib/db";
import { references } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Approving all pending references for testing purposes...");

    const result = await db.update(references)
        .set({ status: 'approved' })
        .where(eq(references.status, 'pending'))
        .returning();

    console.log(`Successfully approved ${result.length} pending references.`);

    process.exit(0);
}

main().catch(console.error);
