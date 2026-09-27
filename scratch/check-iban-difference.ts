import { db } from "../lib/db";
import { applications, users } from "../lib/db/schema";
import { eq, or, inArray } from "drizzle-orm";
import { getCurrentTenant } from "../lib/data/tenant";

async function run() {
    try {
        const apps = await db.query.applications.findMany({
            where: or(
                eq(applications.status, 'selected'),
                eq(applications.status, 'active')
            ),
            with: {
                user: true
            }
        });

        console.log(`Total selected/active apps: ${apps.length}`);
        
        let missing = 0;
        apps.forEach(app => {
            if (app.user?.isActive === false) {
                console.log(`- Filtered out due to isActive === false: ${app.user.fullName} (User ID: ${app.user.id}, App ID: ${app.id})`);
                missing++;
            }
            if (!app.user) {
                console.log(`- Filtered out due to missing user: App ID: ${app.id}`);
                missing++;
            }
        });

        console.log(`Total filtered out: ${missing}`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
