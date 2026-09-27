import { db } from "../lib/db";
import { users, applications } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
    const names = [
        "Kevser EŞREFOĞLU",
        "Nilay AKBULUT",
        "Zeynep ÇAKMAK",
        "Nilay Bahadır"
    ];
    
    const dbUsers = await db.query.users.findMany({
        where: inArray(users.fullName, names)
    });
    
    for (const u of dbUsers) {
        const apps = await db.query.applications.findMany({
            where: (applications, { eq }) => eq(applications.userId, u.id)
        });
        console.log(`User ${u.fullName} (ID: ${u.id}) has ${apps.length} applications`);
    }
    process.exit(0);
}
main();
