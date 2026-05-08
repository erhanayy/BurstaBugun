import { db } from "./lib/db";
import { users, tenantUsers, tenants } from "./lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    // 1. Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, "admin@fbiad.com")
    });

    if (!user) {
        console.error("User admin@fbiad.com not found!");
        process.exit(1);
    }

    // 2. Find FBİAD tenant
    const fbiadTenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, "cfc00202-11c1-48dd-ae63-35fd44c60977")
    });

    if (!fbiadTenant) {
        console.error("FBİAD tenant not found!");
        process.exit(1);
    }

    // 3. Update user to active
    await db.update(users)
        .set({ isActive: true })
        .where(eq(users.id, user.id));

    // 4. Update or insert tenantUser
    const existingMembership = await db.query.tenantUsers.findFirst({
        where: and(
            eq(tenantUsers.userId, user.id),
            eq(tenantUsers.tenantId, fbiadTenant.id)
        )
    });

    if (existingMembership) {
        await db.update(tenantUsers)
            .set({ role: "admin", status: "active" })
            .where(
                and(
                    eq(tenantUsers.userId, user.id),
                    eq(tenantUsers.tenantId, fbiadTenant.id)
                )
            );
        console.log("Membership updated to admin.");
    } else {
        await db.insert(tenantUsers).values({
            tenantId: fbiadTenant.id,
            userId: user.id,
            role: "admin",
            status: "active"
        });
        console.log("New admin membership created for FBİAD.");
    }

    console.log("Successfully made admin@fbiad.com an admin of FBİAD!");
    process.exit(0);
}
main();
