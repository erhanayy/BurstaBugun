import { db } from "../lib/db";
import { users, tenantUsers } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Deleting erhanayyildiz@hotmail.com...");
    const user = await db.query.users.findFirst({
        where: eq(users.email, "erhanayyildiz@hotmail.com")
    });

    if (user) {
        await db.delete(tenantUsers).where(eq(tenantUsers.userId, user.id));
        await db.delete(users).where(eq(users.id, user.id));
        console.log("Deleted user and tenant associations.");
    } else {
        console.log("User not found.");
    }
    process.exit(0);
}

main();
