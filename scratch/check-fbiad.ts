import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { like } from "drizzle-orm";

async function main() {
    const fbiadUser = await db.query.users.findFirst({
        where: like(users.fullName, '%FBİAD%')
    });
    console.log("FBIAD User fullName:", fbiadUser?.fullName);
    process.exit(0);
}
main();
