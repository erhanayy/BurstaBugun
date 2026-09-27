import { db } from "../lib/db";
import { users, applications } from "../lib/db/schema";
import { eq, ilike, and, inArray, or } from "drizzle-orm";

async function main() {
    const studentNames = [
        "Nisa Nur Kılıç"
    ];

    for (const name of studentNames) {
        // Find users by name (case insensitive)
        const foundUsers = await db.query.users.findMany({
            where: ilike(users.fullName, `%${name}%`)
        });

        if (foundUsers.length === 0) {
            console.log(`❌ Not found: ${name}`);
            continue;
        }

        const userIds = foundUsers.map(u => u.id);

        const apps = await db.query.applications.findMany({
            where: inArray(applications.userId, userIds),
            orderBy: (applications, { desc }) => [desc(applications.updatedAt)]
        });

        if (apps.length === 0) {
            console.log(`❌ No application found for: ${name}`);
            continue;
        }

        const app = apps[0]; // Take most recent application

        if (app.status === 'selected' || app.status === 'active' || app.status === 'in_pool') {
            console.log(`⚠️ Skipped ${name}: Already in status '${app.status}'`);
            continue;
        }

        // Set to exemption requested
        let newStatus = app.status;
        if (app.status === 'draft') {
            newStatus = 'waiting_reference'; // Force it to waiting_reference so it shows up in exemptions list
        }

        await db.update(applications)
            .set({ 
                isExemptionRequested: true,
                status: newStatus as any
            })
            .where(eq(applications.id, app.id));

        console.log(`✅ Updated ${name}: isExemptionRequested = true (Status: ${newStatus})`);
    }

    process.exit(0);
}
main().catch(console.error);
