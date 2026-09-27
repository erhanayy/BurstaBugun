import { db } from "../lib/db";
import { funds } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
    try {
        const allFunds = await db.query.funds.findMany();
        
        console.log(`Found ${allFunds.length} funds.`);
        const fundIds = allFunds.map(f => f.id);
        
        if (fundIds.length > 0) {
            await db.update(funds)
                .set({ 
                    publishOnWebsite: true,
                    showOwnerName: true
                })
                .where(inArray(funds.id, fundIds));
                
            console.log(`✅ Updated ${fundIds.length} funds to be visible on the website.`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();
