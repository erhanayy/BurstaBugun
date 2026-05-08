import { db } from "./lib/db";
import { funds, applicationForms } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fbiadId = "cfc00202-11c1-48dd-ae63-35fd44c60977";
    const fbFunds = await db.query.funds.findMany({
        where: eq(funds.tenantId, fbiadId)
    });
    const fbForms = await db.query.applicationForms.findMany({
        where: eq(applicationForms.tenantId, fbiadId)
    });
    console.log("FBİAD Funds:", fbFunds.length);
    console.log("FBİAD Forms:", fbForms.length);
    process.exit(0);
}
main();
