import { db } from "../lib/db";
import { users } from "../lib/db/schema";
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
        console.log(`Email: ${u.email}, DB Name: ${u.fullName}`);
    }
    process.exit(0);
}
main();
