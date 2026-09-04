import { db } from './lib/db';
import { payments, funds } from './lib/db/schema';
import { eq, ne } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Looking for test fund...");
    
    // Find funds with TEST in title
    const allFunds = await db.query.funds.findMany();
    const testFunds = allFunds.filter(f => f.title.toLowerCase().includes('test') || f.title.toLowerCase().includes('deneme'));
    
    if (testFunds.length === 0) {
        console.log("No test funds found.");
        process.exit(0);
    }
    
    for (const testFund of testFunds) {
        console.log("\nFound Test Fund:", testFund.id, testFund.title);
        
        // Get all payments for this fund
        const fundPayments = await db.query.payments.findMany({
            where: eq(payments.fundId, testFund.id),
            orderBy: (p, { asc }) => [asc(p.paymentDate)]
        });
        
        console.log(`Found ${fundPayments.length} payments for this fund.`);
        
        const completedPayments = fundPayments.filter(p => p.status === 'completed');
        console.log(`Found ${completedPayments.length} completed payments.`);
        
        if (completedPayments.length <= 2) {
            console.log("Payments look correct (only 2 or less completed), skipping...");
            continue;
        }
        
        const firstTwoIds = completedPayments.slice(0, 2).map(p => p.id);
        const idsToReset = completedPayments.slice(2).map(p => p.id);
        
        console.log(`Keeping ${firstTwoIds.length} payments as completed.`);
        console.log(`Resetting ${idsToReset.length} payments to pending...`);
        
        for (const id of idsToReset) {
            await db.update(payments)
                .set({ status: 'pending', receiptUrl: null, notes: null })
                .where(eq(payments.id, id));
        }
    }
    
    console.log("\nDone resetting all test funds.");
    process.exit(0);
}

main().catch(console.error);
