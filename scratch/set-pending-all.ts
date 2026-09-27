import { db } from "../lib/db";
import { donations } from "../lib/db/schema";
import { ilike, eq, and, ne } from "drizzle-orm";

async function main() {
    // 1. ERHAN AYYILDIZ kaydını bul ve sil
    const toDelete = await db.select().from(donations).where(
        ilike(donations.donorName, '%ERHAN AYYILDIZ%')
    );
    
    let deletedCount = 0;
    for (const d of toDelete) {
        await db.delete(donations).where(eq(donations.id, d.id));
        deletedCount++;
    }
    console.log(`Silinen Erhan Ayyıldız kaydı: ${deletedCount}`);

    // 2. Bayram Meral HARİÇ diğer completed olanları pending yap
    const toUpdate = await db.select().from(donations).where(
        and(
            eq(donations.status, 'completed'),
            ne(donations.donorEmail, 'bayrammeral@hotmail.com')
        )
    );
    
    let updatedCount = 0;
    for (const d of toUpdate) {
        await db.update(donations).set({ status: 'pending' as any }).where(eq(donations.id, d.id));
        updatedCount++;
    }
    
    console.log(`Pending durumuna çekilen kayıt sayısı: ${updatedCount}`);
    
    process.exit(0);
}
main().catch(console.error);
