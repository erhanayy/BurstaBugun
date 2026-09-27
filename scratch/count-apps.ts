import { db } from "../lib/db";
import { applications, users } from "../lib/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";

async function run() {
    const apps = await db.query.applications.findMany({
        with: { user: true, fund: true }
    });

    console.log(`Total apps: ${apps.length}`);
    
    let active = 0;
    let selected = 0;
    let inPool = 0;
    
    apps.forEach(app => {
        if (app.status === 'active') active++;
        if (app.status === 'selected') selected++;
        if (app.status === 'in_pool') inPool++;
    });

    console.log(`Active: ${active}, Selected: ${selected}, In Pool: ${inPool}`);
    
    // Now simulate IBAN list
    let ibanList = apps.filter(app => (app.status === 'selected' || app.status === 'active') && app.user?.isActive !== false);
    console.log(`IBAN List Count: ${ibanList.length}`);
    
    // Now simulate Admin Dashboard Selected
    console.log(`Admin Dashboard Selected Count: ${selected}`);
    
    process.exit(0);
}
run();
