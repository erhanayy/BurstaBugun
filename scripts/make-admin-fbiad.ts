import { db } from "../lib/db";
import { users, tenantUsers, tenants } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function makeAdmin() {
    console.log("Starting admin assignment...");
    const email = "erhanayyildiz@hotmail.com";

    // Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.error(`User ${email} not found.`);
        process.exit(1);
    }

    // Update isApplicationAdmin
    await db.update(users)
        .set({ isApplicationAdmin: true })
        .where(eq(users.id, user.id));
    console.log(`Updated isApplicationAdmin for ${email}`);

    // Find FBİAD Tenant
    // I know NEXT_PUBLIC_TENANT_ID from previous context: cfc00202-11c1-48dd-ae63-35fd44c60977
    // Let's just find the tenant that matches "FBİAD Vakfı"
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, "cfc00202-11c1-48dd-ae63-35fd44c60977")
    });

    if (!tenant) {
        console.error("FBİAD tenant not found.");
        process.exit(1);
    }

    // Check if user is in tenant
    const tUser = await db.query.tenantUsers.findFirst({
        where: and(
            eq(tenantUsers.tenantId, tenant.id),
            eq(tenantUsers.userId, user.id)
        )
    });

    if (tUser) {
        await db.update(tenantUsers)
            .set({ role: "admin" })
            .where(eq(tenantUsers.id, tUser.id));
        console.log(`Updated tenant role to admin for ${email} in FBİAD tenant.`);
    } else {
        await db.insert(tenantUsers).values({
            tenantId: tenant.id,
            userId: user.id,
            role: "admin"
        });
        console.log(`Added ${email} as admin to FBİAD tenant.`);
    }

    console.log("Done.");
    process.exit(0);
}

makeAdmin().catch(console.error);
