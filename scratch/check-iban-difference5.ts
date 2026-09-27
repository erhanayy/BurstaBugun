import { db } from "../lib/db";
import { applications, parametersTenantSeasons } from "../lib/db/schema";
import { eq, or, and, not } from "drizzle-orm";
import { getCurrentTenant } from "../lib/data/tenant";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        
        const adminListApps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                not(eq(applications.status, 'cancelled'))
            ),
            with: {
                user: true
            }
        });

        const activeCount = adminListApps.filter(a => a.status === 'active').length;
        const selectedCount = adminListApps.filter(a => a.status === 'selected').length;
        console.log(`Admin List active: ${activeCount}`);
        console.log(`Admin List selected: ${selectedCount}`);
        
        let missing = 0;
        adminListApps.forEach(app => {
            if (app.user?.isActive === false && (app.status === 'active' || app.status === 'selected')) {
                console.log(`- Inactive user in selected/active: ${app.user.fullName} (User ID: ${app.user.id}, App ID: ${app.id}, Status: ${app.status})`);
            }
        });

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
