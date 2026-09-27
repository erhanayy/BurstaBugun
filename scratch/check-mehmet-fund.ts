import { db } from "../lib/db";
import { fundSelections, applications, funds, users } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function run() {
    const userRes = await db.query.users.findMany({
        where: ilike(users.fullName, '%Mehmet Faik Canan%')
    });
    
    if (userRes.length === 0) return;
    const user = userRes[0];
    
    const apps = await db.query.applications.findMany({
        where: eq(applications.userId, user.id)
    });
    
    console.log(`Apps for ${user.fullName}:`);
    for (const app of apps) {
        console.log(`- App ID: ${app.id} | status: ${app.status} | isActive: ${app.isActive}`);
        
        const selections = await db.query.fundSelections.findMany({
            where: eq(fundSelections.applicationId, app.id),
            with: { fund: true }
        });
        
        for (const sel of selections) {
            console.log(`  > Selection ID: ${sel.id} | isActive: ${sel.isActive} | Fund: ${sel.fund?.title}`);
        }
    }
    
    process.exit(0);
}
run();
