import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    console.log("--- ONUR KIRCALI'NIN FONLARI ---");
    const onurUsers = await db.select().from(users).where(ilike(users.fullName, '%Onur Kırcalı%'));
    if (onurUsers.length > 0) {
        const onurFunds = await db.select().from(funds).where(eq(funds.ownerId, onurUsers[0].id));
        
        for (const f of onurFunds) {
            console.log(`\nFon: ${f.title} (ID: ${f.id})`);
            const p = await db.select().from(payments).where(eq(payments.fundId, f.id));
            console.log(`Bu fona bağlı ${p.length} ödeme bulundu.`);
            
            p.forEach(pay => {
                console.log(`- Ödeme ID: ${pay.id}, Tutar: ${pay.amount}, Durum: ${pay.status}, Tarih: ${pay.paymentDate}, Not: ${pay.notes}, userId: ${pay.userId}`);
            });
        }
    } else {
        console.log("Onur Kırcalı bulunamadı.");
    }
    
    console.log("\n--- ALPER GERDANERI'NIN ÖDEMELERİ ---");
    const alperUsers = await db.select().from(users).where(ilike(users.fullName, '%Alper Gerdaneri%'));
    if (alperUsers.length > 0) {
        const alperPayments = await db.select().from(payments).where(eq(payments.userId, alperUsers[0].id));
        console.log(`Alper Gerdaneri (ID: ${alperUsers[0].id}) adına ${alperPayments.length} ödeme bulundu.`);
        alperPayments.forEach(pay => {
            console.log(`- Tutar: ${pay.amount}, Durum: ${pay.status}, FonID: ${pay.fundId}, Not: ${pay.notes}`);
        });
    } else {
        console.log("Alper Gerdaneri bulunamadı.");
    }

    process.exit(0);
}
main().catch(console.error);
