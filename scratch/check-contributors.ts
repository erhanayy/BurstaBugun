import { db } from "../lib/db";
import { users, fundContributors } from "../lib/db/schema";
import { like } from "drizzle-orm";

async function main() {
    const emailUsers = await db.query.users.findMany({
        where: like(users.fullName, '%@%')
    });
    console.log("Users with email as fullName:", emailUsers.length);
    if (emailUsers.length > 0) {
        console.log(emailUsers.slice(0, 3).map(u => ({ id: u.id, fullName: u.fullName, email: u.email, phone: u.phoneNumber })));
    }
    
    // check fund contributors count
    const fc = await db.query.fundContributors.findMany();
    console.log("Total fund contributors:", fc.length);
    process.exit(0);
}
main();
