import { db } from "./lib/db";
async function run() {
    const apps = await db.query.applications.findMany({
        columns: { id: true, period: true, status: true }
    });
    console.log(apps.slice(0, 5));
}
run();
