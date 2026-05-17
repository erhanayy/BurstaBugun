import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allUsers = await db.query.users.findMany({
        where: eq(users.fullName, "Hakan Ayyıldız")
    });
    console.log("Hakan Users:");
    for (const u of allUsers) {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Phone: ${u.phoneNumber}`);
    }
}

main().catch(console.error);
