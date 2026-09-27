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
                or(eq(applications.status, 'selected'), eq(applications.status, 'active')),
                eq(applications.isActive, true)
            ),
            with: {
                user: true
            }
        });

        console.log(`Total apps matching 'selected' or 'active': ${apps.length}`);
        
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`FOUND INACTIVE USER: ${app.user.fullName} (Status: ${app.status}, Email: ${app.user.email})`);
            }
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
