import { db } from "../lib/db";
import { payments, users } from "../lib/db/schema";

async function main() {
    const allPayments = await db.select().from(payments);
    const allUsers = await db.select().from(users);
    
    let unknownCount = 0;
    
    for (const p of allPayments) {
        if (!p.userId) {
            console.log(`Bilinmiyor (userId yok): ${p.amount} TL, Tarih: ${p.paymentDate}, Not: ${p.notes}`);
            unknownCount++;
            continue;
        }
        
        const user = allUsers.find(u => u.id === p.userId);
        if (!user) {
            console.log(`Bilinmiyor (user tablosunda yok!): ${p.amount} TL, Tarih: ${p.paymentDate}, Not: ${p.notes}, userId: ${p.userId}`);
            unknownCount++;
            continue;
        }
        
        if (!user.fullName || user.fullName.trim() === '') {
            console.log(`Bilinmiyor (İsim boş): ${p.amount} TL, Tarih: ${p.paymentDate}, Not: ${p.notes}, email: ${user.email}`);
            unknownCount++;
        }
    }
    
    console.log(`Toplam Bilinmiyor: ${unknownCount}`);
    process.exit(0);
}
main().catch(console.error);
