import { db } from './lib/db';
import { payments, funds, users } from './lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

async function main() {
    const fundId = 'f9a97e69-d77e-4068-9951-984226b85821';
    
    // 1. Delete all orphaned pending payments (userId is null)
    const deletedOrphans = await db.delete(payments)
        .where(
            and(
                eq(payments.fundId, fundId),
                isNull(payments.userId),
                eq(payments.status, 'pending')
            )
        ).returning();
        
    console.log(`Deleted ${deletedOrphans.length} orphaned pending payments.`);
    
    // 2. Update the remaining 9 pending wire_transfer payments to subscription
    const updatedPayments = await db.update(payments)
        .set({ paymentMethod: 'subscription' })
        .where(
            and(
                eq(payments.fundId, fundId),
                eq(payments.paymentMethod, 'wire_transfer'),
                eq(payments.status, 'pending')
            )
        ).returning();
        
    console.log(`Updated ${updatedPayments.length} pending wire_transfer payments to subscription.`);
    
    process.exit(0);
}

main().catch(console.error);
