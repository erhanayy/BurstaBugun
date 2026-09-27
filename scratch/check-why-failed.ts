import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const emailsToCheck = [
        "kevseresrefoglu@gmail.com", 
        "akbulutnilaytr@gmail.com", 
        "zeynepcakmak800@gmail.com", 
        "nilaybahadirrr1@gmail.com"
    ];
    
    for (const email of emailsToCheck) {
        const u = await db.query.users.findFirst({
            where: ilike(users.email, email)
        });
        console.log(`Email ${email} -> ${u ? 'FOUND' : 'NOT FOUND'}`);
    }
    process.exit(0);
}
main();
