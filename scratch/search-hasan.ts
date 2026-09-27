import { db } from "../lib/db";
import { donations, payments, users, funds } from "../lib/db/schema";
import { ilike, or, eq } from "drizzle-orm";

async function main() {
    console.log("--- ARAMA BAŞLIYOR: Hasan Yılmaz ---");

    // 1. Users tablosunda ara
    const foundUsers = await db.select().from(users).where(
        or(
            ilike(users.fullName, '%Hasan%Yılmaz%'),
            ilike(users.fullName, '%Hasan%'),
            ilike(users.fullName, '%Yılmaz%')
        )
    );
    
    // Yılmaz ve Hasan çok olabileceği için tam eşleşme veya Hasan Yılmaz içerenleri filtreleyelim
    const filteredUsers = foundUsers.filter(u => 
        u.fullName?.toLowerCase().includes('hasan yılmaz') || 
        u.fullName?.toLowerCase().includes('hasan yilmaz')
    );

    console.log(`\nUsers Tablosu: ${filteredUsers.length} sonuç bulundu.`);
    for (const u of filteredUsers) {
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
            ilike(donations.donorName, '%Hasan Yılmaz%'),
            ilike(donations.donorName, '%Hasan Yilmaz%')
        )
    );
    console.log(`\nDonations (Web Bağışları) Tablosu: ${foundDonations.length} sonuç bulundu.`);
    for (const d of foundDonations) {
        console.log(`- İsim: ${d.donorName}, Tutar: ${d.amount}, Tarih: ${d.createdAt}, Durum: ${d.status}`);
    }

    process.exit(0);
}
main().catch(console.error);
