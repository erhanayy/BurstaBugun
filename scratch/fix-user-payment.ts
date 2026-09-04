import * as dotenv from "dotenv";
import * as fs from "fs";
const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}
import { db } from "../lib/db";
import { payments, funds } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fundId = "a84cd00f-4339-4a07-a098-6f80f36e7f61";
    
    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });
    
    if (!fund || !fund.ownerId) {
        console.log("Fund not found or no owner");
        return;
    }
    
    await db.update(payments)
        .set({ userId: fund.ownerId })
        .where(eq(payments.fundId, fundId));
        
    console.log("Updated payment with correct userId:", fund.ownerId);
    process.exit(0);
}

main().catch(console.error);
