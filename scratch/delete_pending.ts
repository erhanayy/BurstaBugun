import { db } from "../lib/db";
import { payments, funds } from "../lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function run() {
    const allFunds = await db.query.funds.findMany();
    const upfrontFundIds = allFunds.filter(f => f.paymentMethod === 'upfront').map(f => f.id);
    
    if (upfrontFundIds.length > 0) {
        await db.delete(payments).where(
            inArray(payments.fundId, upfrontFundIds)
        );
        console.log("Deleted pending payments for upfront funds.");
    }
    process.exit(0);
}
run();
