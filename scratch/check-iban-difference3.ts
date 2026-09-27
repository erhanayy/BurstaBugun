import { db } from "../lib/db";
import { applications, parametersTenantSeasons } from "../lib/db/schema";
import { eq, or, and } from "drizzle-orm";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: {
                user: true
            }
        });

        console.log(`Total selected/active apps for 2026-2027: ${apps.length}`);
        
        let missing = 0;
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`- Filtered out due to isActive === false: ${app.user.fullName} (User ID: ${app.user.id}, App ID: ${app.id})`);
                missing++;
            }
        });

        console.log(`Total filtered out for 2026-2027: ${missing}`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
