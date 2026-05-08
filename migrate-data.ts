import { db } from "./lib/db";
import { tenants, tenantUsers, loginLogs, funds, applicationForms, applications, notifications, systemParameters } from "./lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    console.log("Finding BurstaBugün tenant...");
    
    // Find tenant by shortName 'BurstaBugün'
    let targetTenant = await db.query.tenants.findFirst({
        where: ilike(tenants.shortName, '%BurstaBugün%')
    });

    if (!targetTenant) {
        // Find any active tenant if BurstaBugün is not found by name
        targetTenant = await db.query.tenants.findFirst({
            where: eq(tenants.isActive, true)
        });
    }

    if (!targetTenant) {
        console.error("No active tenant found to migrate data to!");
        process.exit(1);
    }

    const targetId = targetTenant.id;
    console.log(`Target Tenant ID: ${targetId} (${targetTenant.shortName})`);

    console.log("Migrating tenantUsers...");
    await db.update(tenantUsers).set({ tenantId: targetId });

    console.log("Migrating loginLogs...");
    await db.update(loginLogs).set({ tenantId: targetId });

    console.log("Migrating funds...");
    await db.update(funds).set({ tenantId: targetId });

    console.log("Migrating applicationForms...");
    await db.update(applicationForms).set({ tenantId: targetId });

    console.log("Migrating applications...");
    await db.update(applications).set({ tenantId: targetId });

    console.log("Migrating notifications...");
    await db.update(notifications).set({ tenantId: targetId });

    console.log("Migrating systemParameters...");
    await db.update(systemParameters).set({ tenantId: targetId });

    console.log("Migration completed successfully!");
    process.exit(0);
}

main().catch(console.error);
