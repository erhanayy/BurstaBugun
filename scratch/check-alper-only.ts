import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const alpers = await db.select().from(users).where(ilike(users.fullName, '%Alper%'));
    alpers.forEach(a => console.log(a.fullName, a.email));
    process.exit(0);
}
main().catch(console.error);
