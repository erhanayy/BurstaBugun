import { db } from '../lib/db';
import { tenants, tenantApiTokens } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // FBIAD tenant'ı bul
    const fbiadTenant = await db.query.tenants.findFirst({
        where: eq(tenants.shortName, "FBİAD Vakfı")
    });

    if (!fbiadTenant) {
        console.error("FBİAD tenant bulunamadı!");
        return;
    }

    const testToken = "fbiad_test_token_2026_xyz";

    // Varsa sil
    await db.delete(tenantApiTokens).where(eq(tenantApiTokens.tenantId, fbiadTenant.id));

    // Yeni token ekle
    await db.insert(tenantApiTokens).values({
        tenantId: fbiadTenant.id,
        token: testToken,
        description: "FBIADVakfiWeb API Test Token",
        isActive: true
    });

    console.log(`Token başarıyla eklendi! Tenant ID: ${fbiadTenant.id}, Token: ${testToken}`);
}

main().catch(console.error).finally(() => process.exit(0));
