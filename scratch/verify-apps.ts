import { db } from "../lib/db";
import { users, applications } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
    const emails = [
        "kevseresrefoglu@gmail.com", 
        "akbulutnilaytr@gmail.com", 
        "zeynepcakmak800@gmail.com", 
        "nilaybahadirrr1@gmail.com"
    ];
    
    const dbUsers = await db.query.users.findMany({
        where: inArray(users.email, emails)
    });
    
    for (const u of dbUsers) {
        const apps = await db.query.applications.findMany({
            where: (applications, { eq }) => eq(applications.userId, u.id)
        });
        console.log(`User ${u.fullName.trim()} (ID: ${u.id}) has ${apps.length} applications`);
    }
    process.exit(0);
}
main();
