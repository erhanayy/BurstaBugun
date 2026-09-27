import { db } from "../lib/db";
import { users, applications, parametersTenantSeasons } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function run() {
    const foundUsers = await db.query.users.findMany({
        where: ilike(users.fullName, `%Mehmet Faik Canan%`)
    });

    if (foundUsers.length === 0) {
        console.log("User not found.");
        process.exit(0);
    }
    
    for (const user of foundUsers) {
        console.log(`User: ${user.fullName} (ID: ${user.id}, isActive: ${user.isActive})`);
        
        const apps = await db.query.applications.findMany({
            where: eq(applications.userId, user.id)
        });
        
        for (const app of apps) {
            const period = await db.query.parametersTenantSeasons.findFirst({
                where: eq(parametersTenantSeasons.id, app.period!)
            });
            console.log(`  - App ID: ${app.id}`);
            console.log(`    Period: ${period?.period} (${app.period})`);
            console.log(`    Status: ${app.status}`);
            console.log(`    isActive: ${app.isActive}`);
            console.log(`    isExemptionRequested: ${app.isExemptionRequested}`);
        }
    }
    process.exit(0);
}
run();
