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
    
    if (!fund) {
        console.log("Fund not found");
        return;
    }
    
    // Delete all existing payments for this fund
    await db.delete(payments).where(eq(payments.fundId, fundId));
    console.log("Deleted old payments for fund", fundId);
    
    // Create one single payment for 100000 TL with credit card
    await db.insert(payments).values({
        fundId: fundId,
        tenantId: fund.tenantId,
        userId: fund.ownerId, // Mustafa Senel
        amount: 100000,
        status: 'completed',
        paymentMethod: 'subscription', // means Kredi Kartı in our UI
        paymentDate: new Date("2026-08-30T12:00:00Z"), // Approx when fund was created
        notes: "Peşin / Tek Çekim",
    });
    console.log("Inserted new correct payment of 100.000 TL");
    
    process.exit(0);
}

main().catch(console.error);
