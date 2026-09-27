import { db } from "../lib/db";
import { payments } from "../lib/db/schema";
import { like, isNotNull, eq } from "drizzle-orm";

async function main() {
    // Payments tablosunda notlarında "Bağış ID" geçenleri bul
    const donationPayments = await db.select().from(payments).where(like(payments.notes, '%Bağış ID%'));
    
    console.log(`Notlarında Bağış ID geçen ödeme sayısı: ${donationPayments.length}`);
    
    let updated = 0;
    for (const p of donationPayments) {
        if (!p.notes) continue;
        const match = p.notes.match(/Bağış ID: ([a-f0-9\-]+)/);
        if (match && match[1]) {
            const donationId = match[1];
            await db.update(payments).set({ donationId }).where(eq(payments.id, p.id));
            updated++;
        }
    }
    
    console.log(`Donation ID'si güncellenen ödeme sayısı: ${updated}`);
    process.exit(0);
}
main().catch(console.error);
