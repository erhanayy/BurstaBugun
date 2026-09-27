import { db } from "../lib/db";
import { pledges, pledgeTransactions } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const pledgeRes = await db.select().from(pledges).where(ilike(pledges.fullName, '%Mustafa Şenel%'));
    if (pledgeRes.length === 0) {
        console.log("Mustafa Şenel bulunamadı.");
        process.exit(1);
    }
    
    const pId = pledgeRes[0].id;
    const updateRes = await db.update(pledgeTransactions)
        .set({ allocatedStudentCount: 2 })
        .where(eq(pledgeTransactions.pledgeId, pId))
        .returning();
        
    console.log("Güncellenen işlem sayısı:", updateRes.length);
    process.exit(0);
}
main().catch(console.error);
