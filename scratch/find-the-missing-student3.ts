import { db } from "../lib/db";
import { applications, parametersTenantSeasons } from "../lib/db/schema";
import { eq, and, or } from "drizzle-orm";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                or(eq(applications.status, 'selected'), eq(applications.status, 'active'))
            ),
            with: {
                user: true
            }
        });

        console.log(`Total apps for IBAN query: ${apps.length}`);
        
        let validApps = apps.filter(app => app.user?.isActive !== false);
        console.log(`Total apps shown in IBAN list: ${validApps.length}`);
        
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`FOUND INACTIVE USER: ${app.user.fullName} (App isActive: ${app.isActive}, Status: ${app.status}, Email: ${app.user.email})`);
            }
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
