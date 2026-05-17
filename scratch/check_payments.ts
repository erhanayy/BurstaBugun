import { db } from "@/lib/db";
import { funds, payments, fundContributors, fundSelections, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allFunds = await db.query.funds.findMany();
    const f3d = allFunds.find(f => f.title.includes("3D"));
    if (!f3d) {
        console.log("3D fonu bulunamadı.");
        return;
    }

    console.log("Fund:", f3d.title, "ID:", f3d.id);
    
    const fundPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, f3d.id)
    });
    
    console.log(`Total payments: ${fundPayments.length}`);
    const completed = fundPayments.filter(p => p.status === 'completed');
    console.log(`Completed payments: ${completed.length}`);
    
    // Check unique students
    const uniqueApps = Array.from(new Set(fundPayments.map(p => p.applicationId)));
    console.log(`Unique Applications in payments: ${uniqueApps.length}`);
    
    for (const appId of uniqueApps) {
        const appPayments = fundPayments.filter(p => p.applicationId === appId);
        const comp = appPayments.filter(p => p.status === 'completed').length;
        console.log(`App ${appId}: ${appPayments.length} total, ${comp} completed`);
    }
}

main().catch(console.error);
