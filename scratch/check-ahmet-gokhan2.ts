import { db } from "../lib/db";
import { donations, payments, users } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function main() {
    const ahmetDonation = await db.query.donations.findFirst({
        where: ilike(donations.donorEmail, '%ahmetnuriciger%')
    });
    
    if (!ahmetDonation) {
        console.log("Email ile bağış bulunamadı!");
        process.exit(0);
    }
    
    console.log(`Bağış Bulundu: ID=${ahmetDonation.id}, Status=${ahmetDonation.status}`);
    
    if (ahmetDonation.status !== 'completed') {
        console.log("Bağış completed durumunda değil.");
        process.exit(0);
    }
    
    const linkedPayment = await db.query.payments.findFirst({
        where: eq(payments.donationId, ahmetDonation.id)
    });
    
    if (!linkedPayment) {
        console.log("Payment kaydı yok.");
        process.exit(0);
    }
    
    if (linkedPayment.userId) {
        const assignedUser = await db.query.users.findFirst({
            where: eq(users.id, linkedPayment.userId)
        });
        if (assignedUser) {
            console.log(`Eşleşen Kullanıcı: ${assignedUser.fullName} (Email: ${assignedUser.email})`);
        } else {
            console.log("User bulunamadı.");
        }
    } else {
        console.log("userId boş.");
    }
    
    process.exit(0);
}
main().catch(console.error);
