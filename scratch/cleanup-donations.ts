import { db } from "../lib/db";
import { donations } from "../lib/db/schema";
import { ilike, or, eq } from "drizzle-orm";

async function main() {
    const toCancel = await db.select().from(donations).where(
        or(
            ilike(donations.donorName, '%FETHULLAH ERHAN AYYILDIZ%'),
            ilike(donations.donorName, '%Erhan. Ayyıldız%'),
            ilike(donations.donorName, 'Test%'),
            ilike(donations.donorName, '%Mesut Bebek%'),
            eq(donations.donorEmail, 'erhanayyildiz@hotmail.com')
        )
    );

    let count = 0;
    for (const d of toCancel) {
        await db.update(donations).set({ status: 'cancelled' as any }).where(eq(donations.id, d.id));
        count++;
    }
    
    console.log(`Temizlik tamamlandı: ${count} adet test kaydı iptal edildi.`);
    process.exit(0);
}
main().catch(console.error);
