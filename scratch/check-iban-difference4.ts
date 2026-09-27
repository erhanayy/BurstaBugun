import { db } from "../lib/db";
import { applications, parametersTenantSeasons } from "../lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getCurrentTenant } from "../lib/data/tenant";

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

        const activeCount = apps.filter(a => a.status === 'active').length;
        const selectedCount = apps.filter(a => a.status === 'selected').length;
        console.log(`Total active: ${activeCount}`);
        console.log(`Total selected: ${selectedCount}`);
        
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
