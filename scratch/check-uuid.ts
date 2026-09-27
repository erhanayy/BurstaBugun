import { db } from "../lib/db";
import { applications } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const apps = await db.select({ id: applications.id }).from(applications);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        for (const app of apps) {
            if (!uuidRegex.test(app.id)) {
                console.log(`INVALID UUID FOUND: ${app.id}`);
            }
        }
        console.log("Done checking UUIDs.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
