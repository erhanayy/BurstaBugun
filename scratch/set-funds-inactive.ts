import { db } from "../lib/db";
import { funds } from "../lib/db/schema";
import { inArray, eq, ilike } from "drizzle-orm";

async function main() {
    const titlesToDeactivate = [
        "2026 - 2027 Muhsin Ayyıldız Fonu",
        "2026-2027 Test Fonu 1"
    ];
    
    // Exact match bulmak için
    for (const title of titlesToDeactivate) {
        const found = await db.query.funds.findFirst({
            where: ilike(funds.title, `%${title.replace(' ', '%')}%`) // Boşluklara esneklik
        });
        
        if (found) {
            await db.update(funds).set({ isActive: false }).where(eq(funds.id, found.id));
            console.log(`Pasife çekildi: ${found.title}`);
        } else {
            console.log(`Fon bulunamadı: ${title}`);
        }
    }
    
    process.exit(0);
}
main().catch(console.error);
