import { db } from "../lib/db";
import { applications, users, parametersTenantSeasons } from "../lib/db/schema";
import { eq, and, or, sql } from "drizzle-orm";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        
        // 1. Admin Selected logic:
        const adminSelectedApps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                eq(applications.status, 'selected'),
                eq(applications.isActive, true)
            ),
            with: { user: true }
        });

        // 2. IBAN List logic:
        const ibanApps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: { user: true }
        });
        
        const ibanListFiltered = ibanApps.filter(app => app.user?.isActive !== false);

        console.log(`Admin Selected (active=true): ${adminSelectedApps.length}`);
        console.log(`Admin Selected (including active=false): ${await db.select({c: sql<number>`count(*)`}).from(applications).where(and(eq(applications.period, periodId!), eq(applications.status, 'selected'))).then(r=>r[0].c)}`);
        
        console.log(`IBAN List (selected+active, userActive!=false): ${ibanListFiltered.length}`);
        console.log(`IBAN List (selected ONLY, userActive!=false): ${ibanListFiltered.filter(a => a.status === 'selected').length}`);

        // What if the user is looking at both "selected" and "active"?
        const adminActiveApps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                eq(applications.status, 'active'),
                eq(applications.isActive, true)
            ),
            with: { user: true }
        });
        
        console.log(`Admin Active (active=true): ${adminActiveApps.length}`);
        
        // Let's print users in IBAN list but not in Admin Selected
        const adminSet = new Set(adminSelectedApps.map(a => a.user?.fullName));
        console.log("\nUsers in IBAN List (selected+active) but not in Admin Selected (active=true):");
        for (const app of ibanListFiltered) {
            if (!adminSet.has(app.user?.fullName)) {
                console.log(`- ${app.user?.fullName} (Status: ${app.status})`);
            }
        }
        
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
