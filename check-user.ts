import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const user = await db.query.users.findFirst({
        where: eq(users.email, "superadmin@bb.com")
    });
    console.log("Superadmin user:", user);
    process.exit(0);
}
main();
