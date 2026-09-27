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
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: {
                user: true
            }
        });

        // Current IBAN List code:
        const studentsList = apps.map(app => ({
            applicationId: app.id,
            userId: app.user?.id,
            fullName: app.user?.fullName || "Bilinmeyen",
            isActive: app.user?.isActive,
        })).filter(s => {
            const userIsActive = apps.find(a => a.id === s.applicationId)?.user?.isActive;
            if (userIsActive === false) return false;
            return true;
        });

        console.log(`Current IBAN List Count: ${studentsList.length}`);
        
        // Old IBAN List code (before I modified it):
        const oldStudentsList = apps.map(app => ({
            applicationId: app.id,
            userId: app.user?.id,
            fullName: app.user?.fullName || "Bilinmeyen",
        }));
        
        console.log(`Old IBAN List Count: ${oldStudentsList.length}`);

        // What about "Bursiyer Takip" count?
        const adminApps = apps.filter(a => a.isActive === true);
        console.log(`Admin List Count (applications.isActive == true): ${adminApps.length}`);
        
        // Let's print the ONE person who is in Old IBAN list but not in Admin List:
        // Actually, Old IBAN list = 54. Admin List = 52. Difference is 2.
        
        console.log("Apps where applications.isActive == false:");
        apps.filter(a => a.isActive === false).forEach(a => {
            console.log(`- ${a.user?.fullName} (App ID: ${a.id}, user isActive: ${a.user?.isActive})`);
        });

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
