import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { isNull, eq } from "drizzle-orm";

async function main() {
    const unknownPayments = await db.select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        notes: payments.notes,
        userId: payments.userId,
        fundId: payments.fundId,
        fundName: funds.title,
    })
    .from(payments)
    .leftJoin(users, eq(users.id, payments.userId))
    .leftJoin(funds, eq(funds.id, payments.fundId))
    .where(isNull(users.id)); // Assuming users.id is null makes it "Bilinmiyor"
    
    console.log(`Bulunan "Bilinmiyor" ödeme sayısı (Kullanıcısı olmayan): ${unknownPayments.length}`);
    
    for (let i = 0; i < Math.min(5, unknownPayments.length); i++) {
        const up = unknownPayments[i];
        console.log(`\n--- Ödeme ${i+1} ---`);
        console.log(`ID: ${up.id}`);
        console.log(`Tutar: ${up.amount} TL`);
        console.log(`Tarih: ${up.paymentDate}`);
        console.log(`Notlar: ${up.notes}`);
        console.log(`Bağlı Fon ID: ${up.fundId}`);
        console.log(`Bağlı Fon Adı: ${up.fundName}`);
    }

    // Ayrıca fullName'i boş olan kullanıcılar da olabilir
    const emptyNameUsers = await db.select({
        id: payments.id,
        amount: payments.amount,
        notes: payments.notes,
        userId: users.id,
        email: users.email,
        phone: users.phone
    })
    .from(payments)
    .innerJoin(users, eq(users.id, payments.userId))
    .where(eq(users.fullName, ''));

    console.log(`\nBulunan "İsimsiz Kullanıcıya Ait" ödeme sayısı: ${emptyNameUsers.length}`);
    for (let i = 0; i < Math.min(5, emptyNameUsers.length); i++) {
        const en = emptyNameUsers[i];
        console.log(`\n--- İsimsiz Ödeme ${i+1} ---`);
        console.log(`Tutar: ${en.amount} TL, Not: ${en.notes}`);
        console.log(`User ID: ${en.userId}, Email: ${en.email}, Phone: ${en.phone}`);
    }

    process.exit(0);
}
main().catch(console.error);
