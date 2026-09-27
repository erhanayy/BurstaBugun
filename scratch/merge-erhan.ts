import { db } from "../lib/db";
import { users, fundContributors, payments, tenantUsers } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const dummyId = '8d4a14e5-a064-4e79-812b-1a6d56ba0917';
    const adminId = '6db8eece-6bd8-4191-8df4-60def0978c81';

    await db.update(fundContributors).set({ userId: adminId }).where(eq(fundContributors.userId, dummyId));
    await db.update(payments).set({ userId: adminId }).where(eq(payments.userId, dummyId));
    await db.delete(tenantUsers).where(eq(tenantUsers.userId, dummyId));
    await db.delete(users).where(eq(users.id, dummyId));
    
    console.log("Merged dummy Erhan into admin Erhan!");
    process.exit(0);
}
main();
