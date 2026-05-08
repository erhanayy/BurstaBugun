import { db } from "./lib/db";
import { users, tenantUsers } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const adminEmail = "admin@bb.com";
    const [user] = await db.select().from(users).where(eq(users.email, adminEmail));
    
    if (!user) {
        console.log("User not found");
        process.exit(1);
    }
    
    console.log(`User ${adminEmail} isApplicationAdmin: ${user.isApplicationAdmin}`);
    
    const memberships = await db.select().from(tenantUsers).where(eq(tenantUsers.userId, user.id));
    console.log(`User is in ${memberships.length} tenants`);
    
    process.exit(0);
}

main();
