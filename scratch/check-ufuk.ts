import { db } from "../lib/db";
import { payments, users } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function main() {
    const ufukUser = await db.select().from(users).where(ilike(users.fullName, '%Ufuk Işık%'));
    if (ufukUser.length > 0) {
        const ufukPayments = await db.select().from(payments).where(eq(payments.userId, ufukUser[0].id));
        
        const completed = ufukPayments.filter(p => p.status === 'completed');
        const pending = ufukPayments.filter(p => p.status === 'pending');
        
        console.log(`Toplam Kayıt: ${ufukPayments.length}`);
        console.log(`Gerçekleşen (completed): ${completed.length}`);
        console.log(`Bekleyen (pending/plan): ${pending.length}`);
        
        console.log("\nÖrnek completed:");
        if (completed.length > 0) console.log(completed[0].paymentDate, completed[0].status, completed[0].notes);
        
        console.log("\nÖrnek pending:");
        if (pending.length > 0) console.log(pending[0].paymentDate, pending[0].status, pending[0].notes);
    } else {
        const ufukUser2 = await db.select().from(users).where(ilike(users.fullName, '%Ufuk Isik%'));
        if (ufukUser2.length > 0) {
            const ufukPayments2 = await db.select().from(payments).where(eq(payments.userId, ufukUser2[0].id));
            const completed2 = ufukPayments2.filter(p => p.status === 'completed');
            const pending2 = ufukPayments2.filter(p => p.status === 'pending');
            
            console.log(`Toplam Kayıt: ${ufukPayments2.length}`);
            console.log(`Gerçekleşen (completed): ${completed2.length}`);
            console.log(`Bekleyen (pending/plan): ${pending2.length}`);
        }
    }
    process.exit(0);
}
main().catch(console.error);
