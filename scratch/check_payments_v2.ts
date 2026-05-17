import { db } from "@/lib/db";
import { funds, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fList = await db.query.funds.findMany({
        where: eq(funds.title, "3D Fon V2")
    });
    if (fList.length === 0) return;
    
    const fundId = fList[0].id;
    const fundPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, fundId)
    });

    console.log("Payments for 3D Fon V2:");
    const completed = fundPayments.filter(p => p.status === 'completed');
    console.log(`Total: ${fundPayments.length}, Completed: ${completed.length}`);
    
    const uniqueApps = Array.from(new Set(fundPayments.map(p => p.applicationId)));
    for (const appId of uniqueApps) {
        const pForApp = fundPayments.filter(p => p.applicationId === appId);
        const compForApp = pForApp.filter(p => p.status === 'completed').length;
        console.log(`- App ${appId}: ${compForApp} / ${pForApp.length} completed`);
    }
}

main().catch(console.error);
