import { db } from "../lib/db";
import { applications } from "../lib/db/schema";
import { inArray, eq, sql } from "drizzle-orm";

async function run() {
    try {
        const apps = await db.select({
            status: applications.status,
            count: sql<number>`count(*)::int`
        })
        .from(applications)
        .groupBy(applications.status);
        console.log(apps);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
