import { db } from "../lib/db";
import { donations, payments, users, funds } from "../lib/db/schema";
import { ilike, or, eq } from "drizzle-orm";

async function main() {
    console.log("--- ARAMA BAŞLIYOR: Ahmet Ali Kocataş ---");

    // 1. Users tablosunda ara
    const foundUsers = await db.select().from(users).where(
        or(
            ilike(users.fullName, '%Ahmet Ali%'),
            ilike(users.fullName, '%Kocataş%')
        )
    );
    console.log(`\nUsers Tablosu: ${foundUsers.length} sonuç bulundu.`);
    for (const u of foundUsers) {
        console.log(`- ID: ${u.id}, İsim: ${u.fullName}, Email: ${u.email}, Tel: ${u.phoneNumber}`);
        
        // Bu kullanıcının ödemelerine bak
        const userPayments = await db.select().from(payments).where(eq(payments.userId, u.id));
        console.log(`  Bu kullanıcıya ait Payment (Tahsilat) sayısı: ${userPayments.length}`);
        for (const p of userPayments) {
            console.log(`    - Tutar: ${p.amount}, Tarih: ${p.paymentDate}, Not: ${p.notes}`);
        }
    }

    // 2. Donations tablosunda ara
    const foundDonations = await db.select().from(donations).where(
        or(
            ilike(donations.donorName, '%Ahmet Ali%'),
            ilike(donations.donorName, '%Kocataş%')
        )
    );
    console.log(`\nDonations (Web Bağışları) Tablosu: ${foundDonations.length} sonuç bulundu.`);
    for (const d of foundDonations) {
        console.log(`- İsim: ${d.donorName}, Tutar: ${d.amount}, Tarih: ${d.createdAt}, Durum: ${d.status}`);
    }

    // 3. Funds tablosunda owner olarak ara
    for (const u of foundUsers) {
        const userFunds = await db.select().from(funds).where(eq(funds.ownerId, u.id));
        console.log(`\nFunds Tablosu (Kullanıcı ${u.fullName} ait fonlar): ${userFunds.length} sonuç bulundu.`);
        for (const f of userFunds) {
            console.log(`- Fon: ${f.title}, Toplanan: ${f.collectedAmount}`);
        }
    }

    process.exit(0);
}
main().catch(console.error);
