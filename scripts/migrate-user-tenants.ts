import { db } from "../lib/db";
import { users, tenants } from "../lib/db/schema";
import { ilike, eq, isNull } from "drizzle-orm";

async function main() {
    console.log("Tenant bazlı kullanıcı göç (migration) işlemi başlıyor...");

    // 1. Get Tenant IDs
    const fbiadTenant = await db.query.tenants.findFirst({
        where: ilike(tenants.shortName, "%FBIAD%")
    });

    const bbTenant = await db.query.tenants.findFirst({
        where: ilike(tenants.shortName, "%BurstaBugün%")
    });

    if (!fbiadTenant || !bbTenant) {
        console.error("Gerekli tenantlar bulunamadı! Lütfen veritabanınızı kontrol edin.");
        process.exit(1);
    }

    console.log(`- FBIAD Tenant ID: ${fbiadTenant.id}`);
    console.log(`- BurstaBugun Tenant ID: ${bbTenant.id}`);

    // 2. Fetch All Users
    const allUsers = await db.query.users.findMany();
    console.log(`Sistemde toplam ${allUsers.length} kullanıcı bulundu.`);

    let updatedFbiad = 0;
    let updatedBb = 0;
    let skippedAdmin = 0;
    let otherUsers = 0;

    for (const user of allUsers) {
        if (!user.email) {
            otherUsers++;
            continue; // No email to base decision on
        }

        if (user.email.toLowerCase() === 'admin@bb.com') {
            console.log(`[ATLANDI] Süper Admin: ${user.email} (tenantId = NULL kalacak)`);
            skippedAdmin++;
            continue;
        }

        if (user.email.toLowerCase().endsWith('@fbiad.com')) {
            await db.update(users)
                .set({ tenantId: fbiadTenant.id })
                .where(eq(users.id, user.id));
            updatedFbiad++;
            console.log(`[FBIAD] ${user.email} taşındı.`);
        } 
        else if (user.email.toLowerCase().endsWith('@bb.com')) {
            await db.update(users)
                .set({ tenantId: bbTenant.id })
                .where(eq(users.id, user.id));
            updatedBb++;
            console.log(`[BB] ${user.email} taşındı.`);
        }
        else {
            otherUsers++;
            console.log(`[DİĞER] ${user.email} (Kuruma atanmadı)`);
        }
    }

    console.log("\n====== MIGRATION RAPORU ======");
    console.log(`FBİAD'a taşınan kullanıcı: ${updatedFbiad}`);
    console.log(`BurstaBugün'e taşınan kullanıcı: ${updatedBb}`);
    console.log(`Atlanan Süper Admin: ${skippedAdmin}`);
    console.log(`Diğer (Kurum atanmayan): ${otherUsers}`);
    console.log("==============================");

    process.exit(0);
}

main().catch(console.error);
