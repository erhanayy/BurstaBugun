import { db } from "../lib/db";
import { payments, users } from "../lib/db/schema";
import { isNull, eq, ilike } from "drizzle-orm";

async function main() {
    // Check 'Bilinmiyor' payments (where user is null or user.fullName is null)
    const unknownPayments = await db.select().from(payments).where(isNull(payments.userId));
    console.log("Payments with NULL userId:", unknownPayments.length);
    if(unknownPayments.length > 0) {
        console.log("Sample unknown payment:", unknownPayments[0]);
    }

    // Check Ufuk Isik
    const ufukUser = await db.select().from(users).where(ilike(users.fullName, '%Ufuk Işık%'));
    if(ufukUser.length > 0) {
        const ufukPayments = await db.select().from(payments).where(eq(payments.userId, ufukUser[0].id));
        console.log("Ufuk Isik payments count:", ufukPayments.length);
        console.log("Sample Ufuk Isik payment:", ufukPayments[0]);
    } else {
        // Maybe try different char case
        const ufukUser2 = await db.select().from(users).where(ilike(users.fullName, '%Ufuk Isik%'));
        if(ufukUser2.length > 0) {
            const ufukPayments2 = await db.select().from(payments).where(eq(payments.userId, ufukUser2[0].id));
            console.log("Ufuk Isik payments count:", ufukPayments2.length);
            console.log("Sample Ufuk Isik payment:", ufukPayments2[0]);
        }
    }
    
    process.exit(0);
}
main().catch(console.error);
