import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { isNull, eq } from "drizzle-orm";

async function main() {
    // 1. Önce Bilinmiyor kayıtları çek
    const unknownPayments = await db.select({
        id: payments.id,
        amount: payments.amount,
        ownerName: users.fullName,
        ownerId: funds.ownerId
    })
    .from(payments)
    .leftJoin(funds, eq(funds.id, payments.fundId))
    .leftJoin(users, eq(users.id, funds.ownerId))
    .where(isNull(payments.userId));
    
    let cancelledCount = 0;
    let fixedCount = 0;
    
    for (const p of unknownPayments) {
        if (p.ownerName === "Erhan Ayyıldız") {
            // Erhan Ayyıldız'ın deneme kayıtlarını cancelled yap
            await db.update(payments)
                .set({ status: 'cancelled' })
                .where(eq(payments.id, p.id));
            cancelledCount++;
        } else if (p.ownerId) {
            // Diğerleri için ownerId'yi userId olarak ata
            await db.update(payments)
                .set({ userId: p.ownerId })
                .where(eq(payments.id, p.id));
            fixedCount++;
        }
    }
    
    console.log(`Erhan Ayyıldız'ın ${cancelledCount} deneme kaydı 'cancelled' durumuna çekildi.`);
    console.log(`Sadi, Onur ve Şahin gibi isimlerin ${fixedCount} kaydı düzeltildi (userId = ownerId).`);
    
    process.exit(0);
}
main().catch(console.error);
