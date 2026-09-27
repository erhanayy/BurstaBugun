import { db } from "../lib/db";
import { applications, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const testSeasonId = '6718c3f4-a2a1-4959-847a-00ce71a954e5';

    const testApps = await db.select({
        id: applications.id,
        status: applications.status,
        userName: users.fullName,
        email: users.email
    })
    .from(applications)
    .leftJoin(users, eq(applications.userId, users.id))
    .where(eq(applications.period, testSeasonId));

    console.log("Total apps in Test Dönemi:", testApps.length);
    const statusCounts = testApps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    console.log("Status distribution:", statusCounts);

    console.log("\nSample students (in_pool):");
    console.log(testApps.filter(a => a.status === 'in_pool').slice(0, 5));

    console.log("\nSample students (draft):");
    console.log(testApps.filter(a => a.status === 'draft').slice(0, 5));

    process.exit(0);
}
main();
