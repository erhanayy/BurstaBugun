import { db } from "../lib/db";
import { funds, users } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const f = await db.query.funds.findFirst({
        where: ilike(funds.title, '%Lefter%'),
        with: { owner: true }
    });
    
    if (f) {
        console.log(`Fund: ${f.title}`);
        console.log(`Owner: ${f.owner?.fullName} (${f.ownerId})`);
    } else {
        console.log("Not found");
    }
    process.exit(0);
}
main();
