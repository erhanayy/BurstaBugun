import { db } from "../lib/db";
import { payments, users, funds } from "../lib/db/schema";
import { isNull, eq } from "drizzle-orm";

async function main() {
    const unknownPayments = await db.select({
        id: payments.id,
        amount: payments.amount,
        ownerName: users.fullName,
    })
    .from(payments)
    .leftJoin(funds, eq(funds.id, payments.fundId))
    .leftJoin(users, eq(users.id, funds.ownerId))
    .where(isNull(payments.userId));
    
    console.log(`Toplam Bilinmiyor Kayıt Sayısı: ${unknownPayments.length}`);
    
    const ownerCounts: Record<string, number> = {};
    for (const p of unknownPayments) {
        const name = p.ownerName || "Bilinmiyor (Fonsuz)";
        ownerCounts[name] = (ownerCounts[name] || 0) + 1;
    }
    
    console.log("\nFon Sahiplerine Göre Dağılım:");
    Object.entries(ownerCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, count]) => {
            console.log(`- ${name}: ${count} ödeme`);
        });

    process.exit(0);
}
main().catch(console.error);
