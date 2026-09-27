import { db } from "../lib/db";
import { funds, parametersTenantSeasons } from "../lib/db/schema";

async function main() {
    const fs = await db.query.funds.findMany();
    for (const f of fs) {
        console.log(`Fund ${f.title}: publishOnWebsite=${f.publishOnWebsite}, isActive=${f.isActive}`);
    }
    
    const s = await db.query.parametersTenantSeasons.findMany();
    for (const season of s) {
        console.log(`Season ${season.period}: publishOnWebsite=${season.publishOnWebsite}`);
    }
    process.exit(0);
}
main();
