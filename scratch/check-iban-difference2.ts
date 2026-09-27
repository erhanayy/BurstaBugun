import { db } from "../lib/db";
import { applications, parametersTenantSeasons } from "../lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getCurrentTenant } from "../lib/data/tenant";

async function run() {
    try {
        const period = '2026-2027';
        
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, period),
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: {
                user: true
            }
        });

        console.log(`Total selected/active apps for ${period}: ${apps.length}`);
        
        let missing = 0;
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`- Filtered out due to isActive === false: ${app.user.fullName} (User ID: ${app.user.id}, App ID: ${app.id})`);
                missing++;
            }
        });

        console.log(`Total filtered out for ${period}: ${missing}`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
