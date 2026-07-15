import { db } from "../lib/db";
import { users, tenantUsers, tenants, funds, applications, payments, fundSelections, fundContributors, references, fundInvitations, notifications, userNotificationSettings, userContracts } from "../lib/db/schema";
import { eq, inArray, and, notInArray } from "drizzle-orm";

async function runStage1() {
    console.log("Starting Stage 1...");
    const tenantId = "cfc00202-11c1-48dd-ae63-35fd44c60977"; // FBİAD

    // 1. Update email
    console.log("Updating email for erhanayyildiz@hotmail.com to @gmail.com...");
    const oldEmailUser = await db.query.users.findFirst({
        where: eq(users.email, "erhanayyildiz@hotmail.com")
    });
    if (oldEmailUser) {
        await db.update(users).set({ email: "erhanayyildiz@gmail.com" }).where(eq(users.id, oldEmailUser.id));
    }

    // 2. Make erhanayyildiz@gmail.com an admin
    console.log("Making erhanayyildiz@gmail.com an admin...");
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, "erhanayyildiz@gmail.com")
    });
    if (adminUser) {
        await db.update(users).set({ isApplicationAdmin: true }).where(eq(users.id, adminUser.id));
        const tUser = await db.query.tenantUsers.findFirst({
            where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.userId, adminUser.id))
        });
        if (tUser) {
            await db.update(tenantUsers).set({ role: "admin" }).where(eq(tenantUsers.id, tUser.id));
        } else {
            await db.insert(tenantUsers).values({
                tenantId,
                userId: adminUser.id,
                role: "admin"
            });
        }
    }

    // 3. Delete Funds, Apps, Payments
    console.log("Deleting FBİAD Funds, Applications, and Payments...");
    const tenantFunds = await db.query.funds.findMany({ where: eq(funds.tenantId, tenantId) });
    const fundIds = tenantFunds.map(f => f.id);
    const tenantApps = await db.query.applications.findMany({ where: eq(applications.tenantId, tenantId) });
    const appIds = tenantApps.map(a => a.id);

    if (appIds.length > 0) {
        await db.delete(payments).where(inArray(payments.applicationId, appIds));
        await db.delete(fundSelections).where(inArray(fundSelections.applicationId, appIds));
        await db.delete(references).where(inArray(references.applicationId, appIds));
        await db.delete(applications).where(inArray(applications.id, appIds));
    }

    if (fundIds.length > 0) {
        await db.delete(fundInvitations).where(inArray(fundInvitations.fundId, fundIds));
        await db.delete(fundContributors).where(inArray(fundContributors.fundId, fundIds));
        await db.delete(funds).where(inArray(funds.id, fundIds));
    }

    // 4. Clean users except the allowed ones
    console.log("Cleaning other users...");
    const keepEmails = ["guvengulesce@fbiad.org", "erhanayyildiz@gmail.com", "damlabirbudak@fbiad.org"];
    
    // Find all users connected to FBİAD tenant
    const fbiadTenantUsers = await db.query.tenantUsers.findMany({
        where: eq(tenantUsers.tenantId, tenantId),
        with: { user: true }
    });

    const userIdsToDelete = fbiadTenantUsers
        .filter(tu => tu.user && !keepEmails.includes(tu.user.email))
        .map(tu => tu.userId);

    if (userIdsToDelete.length > 0) {
        console.log(`Deleting ${userIdsToDelete.length} users...`);
        await db.delete(notifications).where(inArray(notifications.userId, userIdsToDelete));
        await db.delete(userNotificationSettings).where(inArray(userNotificationSettings.userId, userIdsToDelete));
        await db.delete(userContracts).where(inArray(userContracts.userId, userIdsToDelete));
        await db.delete(tenantUsers).where(inArray(tenantUsers.userId, userIdsToDelete));
        await db.delete(users).where(inArray(users.id, userIdsToDelete));
    }

    console.log("Stage 1 completed successfully.");
    process.exit(0);
}

runStage1().catch(console.error);
