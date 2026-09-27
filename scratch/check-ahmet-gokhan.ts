import { db } from "../lib/db";
import { donations, payments, users } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function main() {
    console.log("--- Ahmet Nuri Ciğer Bağış Kontrolü ---");
    
    const ahmetDonation = await db.query.donations.findFirst({
        where: ilike(donations.donorName, '%Ahmet Nuri Ciğer%')
    });
    
    if (!ahmetDonation) {
        console.log("Ahmet Nuri Ciğer'e ait bir bağış (donations) kaydı bulunamadı!");
        process.exit(0);
    }
    
    console.log(`Bağış Bulundu: ID=${ahmetDonation.id}, Status=${ahmetDonation.status}, Amount=${ahmetDonation.amount}`);
    
    if (ahmetDonation.status !== 'completed') {
        console.log("Bu bağış henüz onaylanmamış (completed değil). Dolayısıyla henüz bir kullanıcıya atanmamış.");
        process.exit(0);
    }
    
    const linkedPayment = await db.query.payments.findFirst({
        where: eq(payments.donationId, ahmetDonation.id)
    });
    
    if (!linkedPayment) {
        console.log("Bağış onaylanmış görünse de payment tablosunda donationId eşleşmesi bulunamadı.");
        process.exit(0);
    }
    
    console.log(`Payment Bulundu: ID=${linkedPayment.id}, UserId=${linkedPayment.userId}`);
    
    if (linkedPayment.userId) {
        const assignedUser = await db.query.users.findFirst({
            where: eq(users.id, linkedPayment.userId)
        });
        
        if (assignedUser) {
            console.log(`\nEşleşen Kullanıcı (Sponsor):`);
            console.log(`- İsim: ${assignedUser.fullName}`);
            console.log(`- Email: ${assignedUser.email}`);
            console.log(`- Tel: ${assignedUser.phoneNumber}`);
        } else {
            console.log("Atanan userId veritabanında bulunamadı!");
        }
    } else {
        console.log("Payment kaydında userId yok.");
    }
    
    process.exit(0);
}
main().catch(console.error);
