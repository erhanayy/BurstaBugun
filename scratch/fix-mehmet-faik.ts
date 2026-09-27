import { db } from "../lib/db";
import { users, applications } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function run() {
    try {
        const foundUsers = await db.query.users.findMany({
            where: ilike(users.fullName, `%Mehmet Faik Canan%`)
        });

        if (foundUsers.length === 0) {
            console.log("User not found.");
            process.exit(0);
        }
        
        const user = foundUsers[0];
        
        // Fix user active status
        if (!user.isActive) {
            await db.update(users).set({ isActive: true }).where(eq(users.id, user.id));
            console.log(`✅ Fixed user.isActive = true for ${user.fullName}`);
        }
        
        const apps = await db.query.applications.findMany({
            where: eq(applications.userId, user.id)
        });
        
        for (const app of apps) {
            if (app.isActive && app.status === 'waiting_reference') {
                await db.update(applications)
                    .set({ isExemptionRequested: true })
                    .where(eq(applications.id, app.id));
                console.log(`✅ Set isExemptionRequested = true for active App ID: ${app.id}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
