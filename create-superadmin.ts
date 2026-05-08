import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking for superadmin@bb.com...");
    let superAdmin = await db.query.users.findFirst({
        where: eq(users.email, 'superadmin@bb.com')
    });

    if (superAdmin) {
        console.log("User already exists, updating to Application Admin...");
        await db.update(users)
            .set({ isApplicationAdmin: true })
            .where(eq(users.email, 'superadmin@bb.com'));
        console.log("Updated.");
        process.exit(0);
    }

    console.log("Fetching admin@bb.com to copy password...");
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, 'admin@bb.com')
    });

    if (!adminUser) {
        console.error("admin@bb.com not found!");
        process.exit(1);
    }

    console.log("Creating superadmin@bb.com...");
    await db.insert(users).values({
        fullName: "Sistem Süper Yöneticisi",
        email: "superadmin@bb.com",
        phoneNumber: "05559998877",
        password: adminUser.password,
        isApplicationAdmin: true,
        isActive: true,
        forcePasswordChange: false
    });

    console.log("superadmin@bb.com created successfully!");
    process.exit(0);
}

main().catch(console.error);
