import { db } from '../lib/db';
import { fundSelections, funds } from '../lib/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function fix() {
    console.log('Fixing sponsorIds...');
    const selections = await db.query.fundSelections.findMany({
        where: isNull(fundSelections.sponsorId),
        with: { fund: true }
    });
    
    let count = 0;
    for (const sel of selections) {
        if (sel.fund && sel.fund.ownerId) {
            await db.update(fundSelections)
                .set({ sponsorId: sel.fund.ownerId })
                .where(eq(fundSelections.id, sel.id));
            count++;
        }
    }
    console.log('Fixed', count, 'selections.');
    process.exit(0);
}
fix();
