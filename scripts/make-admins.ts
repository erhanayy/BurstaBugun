import { db } from "../lib/db";
import { users, tenants, tenantUsers } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
  console.log("Admin yapma işlemi başlıyor...");

  const fbiadTenant = await db.query.tenants.findFirst({
    where: ilike(tenants.shortName, "%FBIAD%")
  });

  if (!fbiadTenant) {
    console.error("FBIAD tenant bulunamadı.");
    return;
  }
  console.log("Tenant bulundu:", fbiadTenant.longName);

  const targetNames = ["Güven Gülesce", "Damla Birbudak"];

  for (const name of targetNames) {
    const user = await db.query.users.findFirst({
      where: ilike(users.fullName, `%${name}%`)
    });

    if (!user) {
      console.error(`Kullanıcı bulunamadı: ${name}`);
      continue;
    }
    console.log(`Kullanıcı bulundu: ${user.fullName} (${user.id})`);

    const existingRecord = await db.query.tenantUsers.findFirst({
      where: (tu, { and, eq }) => and(
        eq(tu.tenantId, fbiadTenant.id),
        eq(tu.userId, user.id)
      )
    });

    if (existingRecord) {
      console.log(`Zaten üye kaydı var, role 'admin' olarak güncelleniyor...`);
      await db.update(tenantUsers)
        .set({ role: "admin" })
        .where(eq(tenantUsers.id, existingRecord.id));
      console.log(`${user.fullName} başarıyla admin yapıldı (Güncellendi)`);
    } else {
      console.log(`Kayıt yok, yeni tenantUser kaydı oluşturuluyor...`);
      await db.insert(tenantUsers).values({
        tenantId: fbiadTenant.id,
        userId: user.id,
        role: "admin",
        status: "active",
        isActive: true
      });
      console.log(`${user.fullName} başarıyla admin yapıldı (Yeni eklendi)`);
    }
  }

  console.log("İşlem tamamlandı.");
  process.exit(0);
}

main().catch(console.error);
