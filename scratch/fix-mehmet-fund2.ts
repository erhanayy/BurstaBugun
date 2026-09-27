import { db } from "../lib/db";
import { fundSelections, applications } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const appId = 'b7646514-520f-4981-874e-03ae970be4ab';
        const selId = '893d95f2-ce45-438a-977c-9fbf00f0a75e';
        
        await db.update(fundSelections)
            .set({ isActive: false })
            .where(eq(fundSelections.id, selId));
            
        await db.update(applications)
            .set({ status: 'canceled' as any })
            .where(eq(applications.id, appId));
            
        console.log("✅ Fixed old application and fund selection for Mehmet Faik Canan");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
