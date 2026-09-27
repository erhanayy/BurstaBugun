import { db } from "../lib/db";
import { donations } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function main() {
    const record = await db.query.donations.findFirst({
        where: ilike(donations.donorName, '%bayram%')
    });
    
    if (record) {
        await db.update(donations)
            .set({ status: 'pending' as any })
            .where(eq(donations.id, record.id));
        console.log(`Kayıt güncellendi: ${record.donorName} -> pending`);
    } else {
        console.log("Kayıt bulunamadı.");
    }
    process.exit(0);
}
main().catch(console.error);
