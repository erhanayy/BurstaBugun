import { db } from "../lib/db";
import { funds } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
    const fbiadUserId = '8c9e3f7f-1ae3-4626-ab3f-4ebe1e034cc5';
    
    // The funds have periods '2024-2025' and '2025-2026'
    // But they have title containing FBIAD Fonu
    const fs = await db.query.funds.findMany();
    
    const targetFundIds: string[] = [];
    for (const f of fs) {
        if (f.title.includes("2024-2025 FBIAD") || f.title.includes("2025-2026 FBIAD")) {
            targetFundIds.push(f.id);
            console.log(`Will update owner of: ${f.title}`);
        }
    }
    
    if (targetFundIds.length > 0) {
        await db.update(funds)
            .set({ ownerId: fbiadUserId })
            .where(inArray(funds.id, targetFundIds));
        console.log("Updated owners to FBİAD Vakfı successfully.");
    }
    process.exit(0);
}
main();
