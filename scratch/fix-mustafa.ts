import { db } from "../lib/db";
import { pledges } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const res = await db.update(pledges)
        .set({ actualStudentCount: 2 })
        .where(ilike(pledges.fullName, '%Mustafa Şenel%'))
        .returning();
    console.log("Güncellenen kayıtlar:", res.length);
    process.exit(0);
}
main().catch(console.error);
