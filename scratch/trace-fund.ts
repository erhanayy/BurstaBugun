import { db } from "../lib/db";
import { funds, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fundDetails = await db.select({
        fundName: funds.title,
        ownerId: funds.ownerId,
        ownerName: users.fullName,
        ownerEmail: users.email
    })
    .from(funds)
    .leftJoin(users, eq(users.id, funds.ownerId))
    .where(eq(funds.id, '4f23b9c5-1b13-4b87-9941-056145a719ec'));
    
    console.log(JSON.stringify(fundDetails, null, 2));
    process.exit(0);
}
main().catch(console.error);
