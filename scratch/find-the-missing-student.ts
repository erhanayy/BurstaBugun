import { db } from "../lib/db";
import { applications, users, parametersTenantSeasons } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId!),
                eq(applications.status, 'selected'),
                eq(applications.isActive, true)
            ),
            with: {
                user: true
            }
        });

        console.log(`Total apps matching Bursiyer Takip "Seçilmişler" tab: ${apps.length}`);
        
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`FOUND: ${app.user.fullName} (Email: ${app.user.email})`);
            }
        });
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
