import { db } from "../lib/db";
import { pledges } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const alpers = await db.select().from(pledges).where(ilike(pledges.fullName, '%Alper%'));
    alpers.forEach(a => console.log(a.fullName, a.targetStudentCount, a.status));
    process.exit(0);
}
main().catch(console.error);
