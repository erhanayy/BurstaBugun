import { db } from "./lib/db";
import { tenants } from "./lib/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const fbiadTenants = await db.query.tenants.findMany({
        where: ilike(tenants.shortName, "%FBIAD%")
    });
    
    if (fbiadTenants.length === 0) {
        const allTenants = await db.select().from(tenants);
        console.log("FBİAD bulunamadı. Tüm tenantlar:", allTenants);
    } else {
        console.log("Bulunan FBİAD Tenantları:", fbiadTenants);
    }
    
    process.exit(0);
}
main();
