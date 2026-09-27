import { db } from "../lib/db";
import { users, tenantUsers } from "../lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
    const checkNames = ["Azra Melike Kaymaz", "Abdullah Kirik"];
    
    const uList = await db.query.users.findMany({
        where: inArray(users.fullName, checkNames)
    });
    
    for (const u of uList) {
        const tu = await db.query.tenantUsers.findFirst({
            where: eq(tenantUsers.userId, u.id)
        });
        console.log(`User: ${u.fullName} -> Role: ${tu?.role}`);
    }
    
    process.exit(0);
}
main().catch(console.error);
