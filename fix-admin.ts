import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const adminEmail = "admin@bb.com";
    await db.update(users)
        .set({ isApplicationAdmin: false })
        .where(eq(users.email, adminEmail));
        
    console.log(`User ${adminEmail} is now a regular admin (isApplicationAdmin: false)`);
    process.exit(0);
}

main();
