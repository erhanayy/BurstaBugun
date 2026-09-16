import { db } from './lib/db';
import { payments, funds, users } from './lib/db/schema';
import { eq, and } from 'drizzle-orm';

async function main() {
    const user = await db.query.users.findFirst({
        where: eq(users.email, 'emre.yesilyurt@inovamobilya.com')
    });
    
    if (!user) {
        console.log("User not found!");
        process.exit(1);
    }
    
    console.log("Found user:", user.id);
    
    const userFunds = await db.query.funds.findMany({
        where: eq(funds.ownerId, user.id)
    });
    
    console.log("User funds:", userFunds.map(f => ({ id: f.id, title: f.title })));
    
    for (const fund of userFunds) {
        const fundPayments = await db.query.payments.findMany({
            where: eq(payments.fundId, fund.id)
        });
        
        console.log(`Payments for fund ${fund.title} (${fund.id}):`);
        console.log(fundPayments.map(p => ({
            id: p.id,
            userId: p.userId,
            amount: p.amount,
            status: p.status,
            method: p.paymentMethod,
            date: p.paymentDate
        })));
    }
    
    process.exit(0);
}

main().catch(console.error);
