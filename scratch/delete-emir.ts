import { db } from "../lib/db";
import { pledges, pledgeTransactions } from "../lib/db/pledge-schema";
import { ilike, or, eq } from "drizzle-orm";

async function main() {
    const emirPledge = await db.query.pledges.findFirst({
        where: or(
            ilike(pledges.phone, '%Ekstra gönderebilirim dedi%'),
            ilike(pledges.email, '%Ekstra gönderebilirim dedi%'),
            eq(pledges.fullName, 'Emir')
        )
    });
    
    if (!emirPledge) {
        console.log("Kayıt bulunamadı!");
        process.exit(0);
    }
    
    console.log(`Silinecek Kayıt Bulundu: ID=${emirPledge.id}, İsim=${emirPledge.fullName}, Telefon=${emirPledge.phone}, Email=${emirPledge.email}`);
    
    // İşlemleri varsa önce onları temizleyelim
    const tx = await db.select().from(pledgeTransactions).where(eq(pledgeTransactions.pledgeId, emirPledge.id));
    if (tx.length > 0) {
        console.log(`Bağlı ${tx.length} adet işlem var, önce onlar siliniyor...`);
        await db.delete(pledgeTransactions).where(eq(pledgeTransactions.pledgeId, emirPledge.id));
    }
    
    await db.delete(pledges).where(eq(pledges.id, emirPledge.id));
    console.log("Taahhüt (Pledge) başarıyla silindi!");
    
    process.exit(0);
}
main().catch(console.error);
