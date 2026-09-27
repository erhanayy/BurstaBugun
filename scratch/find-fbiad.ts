import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const fbiadUsers = await db.query.users.findMany({
        where: ilike(users.fullName, '%FBİAD%')
    });
    console.log("FBİAD users:", fbiadUsers);
    
    const fbiadUsers2 = await db.query.users.findMany({
        where: ilike(users.fullName, '%FBIAD%')
    });
    console.log("FBIAD users:", fbiadUsers2);

    process.exit(0);
}
main();
