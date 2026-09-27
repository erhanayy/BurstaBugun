import { db } from "../lib/db";
import { parametersTenantSeasons } from "../lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
    try {
        // First set all to false
        await db.update(parametersTenantSeasons).set({ publishOnWebsite: false });
        
        // Then set 2026-2027 to true
        const res = await db.update(parametersTenantSeasons)
            .set({ publishOnWebsite: true })
            .where(eq(parametersTenantSeasons.period, "2026-2027"))
            .returning();
            
        console.log(`✅ Set publishOnWebsite=true for ${res.length} seasons.`);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();
