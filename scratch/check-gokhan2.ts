import { db } from "../lib/db";
import { users, funds, fundSelections, payments, donations, pledgeTransactions, pledges } from "../lib/db/schema";
import { ilike, eq } from "drizzle-orm";

async function main() {
    console.log("--- Gökhan Kesici Durum Analizi ---");
    
    const foundUsers = await db.select().from(users).where(ilike(users.email, '%gknksc@gmail.com%'));
    console.log(`Bulunan Kullanıcı Sayısı: ${foundUsers.length}`);
    
    for (const u of foundUsers) {
        console.log(`\nKullanıcı: ${u.fullName} (ID: ${u.id}, Email: ${u.email})`);
        
        // Funds
        const myFunds = await db.select().from(funds).where(eq(funds.ownerId, u.id));
        console.log(`Sahip Olduğu Fon Sayısı: ${myFunds.length}`);
        
        for (const f of myFunds) {
            console.log(`- Fon Adı: ${f.title} (Başlangıç: ${f.startDate}, Süre: ${f.durationMonths} ay)`);
            
            const selections = await db.select().from(fundSelections).where(eq(fundSelections.fundId, f.id));
            console.log(`  Seçilen Öğrenci Sayısı: ${selections.length}`);
            
            const fundPayments = await db.select().from(payments).where(eq(payments.fundId, f.id));
            console.log(`  Bu fona bağlı Payment (Taksit) Sayısı: ${fundPayments.length}`);
            for (const p of fundPayments) {
                console.log(`    * [${p.status}] Tutar: ${p.amount}, Not: ${p.notes}`);
            }
        }
        
        // Pledges
        const myPledges = await db.select().from(pledges).where(eq(pledges.userId, u.id));
        console.log(`\nKullanıcıya Bağlı Taahhüt (Pledge) Sayısı: ${myPledges.length}`);
        for (const p of myPledges) {
            console.log(`- Taahhüt: Toplam ${p.totalAmount} TL, Kalan ${p.remainingAmount} TL (Durum: ${p.status})`);
            const pTx = await db.select().from(pledgeTransactions).where(eq(pledgeTransactions.pledgeId, p.id));
            console.log(`  Taahhüt İşlem Sayısı: ${pTx.length}`);
            for (const tx of pTx) {
                console.log(`    * İşlem ID: ${tx.id}, Tutar: ${tx.amount}, PaymentId: ${tx.paymentId}`);
            }
        }
        
        // User's Payments
        const allPayments = await db.select().from(payments).where(eq(payments.userId, u.id));
        console.log(`\nKullanıcının Toplam Payment (Tahsilat/Taksit) Sayısı: ${allPayments.length}`);
    }
    
    // User's Donations (from exterior)
    const userDonations = await db.select().from(donations).where(ilike(donations.donorEmail, '%gknksc@gmail.com%'));
    console.log(`\nBu emaile bağlı 'Donations' (Harici Bağış) Sayısı: ${userDonations.length}`);
    for (const d of userDonations) {
        console.log(`- Donation ID: ${d.id}, Miktar: ${d.amount}, Durum: ${d.status}`);
    }
    
    process.exit(0);
}
main().catch(console.error);
