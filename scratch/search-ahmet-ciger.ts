import { db } from "../lib/db";
import { users, funds, fundSelections, payments, donations } from "../lib/db/schema";
import { ilike, eq, or } from "drizzle-orm";

async function main() {
    console.log("--- Ahmet Nuri Ciğer Durum Analizi ---");
    
    const foundUsers = await db.select().from(users).where(
        or(
            ilike(users.email, '%ahmetnuriciger%'),
            ilike(users.fullName, '%Ciğer%')
        )
    );
    console.log(`Bulunan Kullanıcı Sayısı: ${foundUsers.length}`);
    
    for (const u of foundUsers) {
        console.log(`\nKullanıcı: ${u.fullName} (ID: ${u.id}, Email: ${u.email})`);
        
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
    }
    
    process.exit(0);
}
main().catch(console.error);
