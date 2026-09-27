import { db } from "../lib/db";
import { funds, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const erhanUser = await db.query.users.findFirst({
        where: eq(users.email, 'erhanayyildiz@gmail.com')
    });
    
    if (!erhanUser) process.exit(1);

    const fnds = await db.select().from(funds).where(eq(funds.ownerId, erhanUser.id));
    console.log("Erhan's Funds:");
    fnds.forEach(f => console.log(`ID: ${f.id}, Title: ${f.title}, isActive: ${f.isActive}`));
    process.exit(0);
}
main().catch(console.error);
