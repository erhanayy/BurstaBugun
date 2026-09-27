import { db } from "../lib/db";
import { users, funds, tenantUsers } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

async function main() {
    const tenantId = 'cfc00202-11c1-48dd-ae63-35fd44c60977'; // Found from earlier error log

    let fbiadUser = await db.query.users.findFirst({
        where: eq(users.email, 'fbiad@fbiad.org')
    });

    if (!fbiadUser) {
        console.log("FBIAD User creating...");
        const result = await db.insert(users).values({
            tenantId: tenantId,
            fullName: 'FBİAD Vakfı',
            email: 'fbiad@fbiad.org',
            phoneNumber: '02120000000',
            password: crypto.randomBytes(16).toString('hex'), 
            isActive: true,
        }).returning();
        fbiadUser = result[0];
    } else {
        console.log("FBIAD User exists.");
        await db.update(users).set({ fullName: 'FBİAD Vakfı' }).where(eq(users.id, fbiadUser.id));
    }

    const tu = await db.query.tenantUsers.findFirst({
        where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.userId, fbiadUser.id))
    });

    if (!tu) {
        await db.insert(tenantUsers).values({
            tenantId: tenantId,
            userId: fbiadUser.id,
            role: 'sponsor',
            status: 'active'
        });
        console.log("Tenant user mapping created.");
    }

    // Erhan's active fund
    const targetFund = await db.query.funds.findFirst({
        where: eq(funds.id, '5767486d-22e2-494e-8108-04f787799ebf')
    });

    if (targetFund) {
        console.log(`Transferring fund: ${targetFund.title}`);
        await db.update(funds).set({ ownerId: fbiadUser.id }).where(eq(funds.id, targetFund.id));
        console.log("Fund transferred successfully!");
    }

    process.exit(0);
}
main().catch(console.error);
