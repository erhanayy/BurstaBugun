import { db } from "../lib/db";
import { users, tenantUsers, tenants, funds, applications, payments, fundSelections, fundContributors, references, fundInvitations } from "../lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function cleanTestData() {
    console.log("Starting test data cleanup for FBİAD Tenant...");
    const tenantId = "cfc00202-11c1-48dd-ae63-35fd44c60977"; // FBİAD

    // 1. Find all funds in this tenant
    const tenantFunds = await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantId)
    });
    const fundIds = tenantFunds.map(f => f.id);

    // 2. Find all applications in this tenant
    const tenantApps = await db.query.applications.findMany({
        where: eq(applications.tenantId, tenantId)
    });
    const appIds = tenantApps.map(a => a.id);

    // Start deleting...
    console.log(`Found ${appIds.length} applications and ${fundIds.length} funds to delete.`);

    if (appIds.length > 0) {
        console.log("Deleting payments...");
        await db.delete(payments).where(inArray(payments.applicationId, appIds));
        
        console.log("Deleting fund_selections...");
        await db.delete(fundSelections).where(inArray(fundSelections.applicationId, appIds));

        console.log("Deleting references...");
        await db.delete(references).where(inArray(references.applicationId, appIds));

        console.log("Deleting applications...");
        await db.delete(applications).where(inArray(applications.id, appIds));
    }

    if (fundIds.length > 0) {
        console.log("Deleting fund_invitations...");
        await db.delete(fundInvitations).where(inArray(fundInvitations.fundId, fundIds));

        console.log("Deleting fund_contributors...");
        await db.delete(fundContributors).where(inArray(fundContributors.fundId, fundIds));

        console.log("Deleting funds...");
        await db.delete(funds).where(inArray(funds.id, fundIds));
    }

    // Clean orphaned users (users that have no tenantUsers records)
    const allUsers = await db.select().from(users);
    const allTenantUsers = await db.select().from(tenantUsers);
    
    const usersWithTenants = new Set(allTenantUsers.map(tu => tu.userId));
    const orphanedUserIds = allUsers.filter(u => !usersWithTenants.has(u.id)).map(u => u.id);

    if (orphanedUserIds.length > 0) {
        console.log(`Found ${orphanedUserIds.length} orphaned users to delete.`);
        
        console.log("Deleting notifications and contracts...");
        const { notifications, userNotificationSettings, userContracts } = require("../lib/db/schema");
        await db.delete(notifications).where(inArray(notifications.userId, orphanedUserIds));
        await db.delete(userNotificationSettings).where(inArray(userNotificationSettings.userId, orphanedUserIds));
        await db.delete(userContracts).where(inArray(userContracts.userId, orphanedUserIds));

        console.log("Deleting users...");
        await db.delete(users).where(inArray(users.id, orphanedUserIds));
    }

    console.log("Cleanup complete!");
    process.exit(0);
}

cleanTestData().catch(console.error);
