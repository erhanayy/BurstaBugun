import { db } from "../lib/db";
import { users, tenantUsers, funds, tenants } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

async function main() {
    // 1. Find the tenant (FBIAD)
    const allTenants = await db.select().from(tenants);
    const fbiadTenant = allTenants.find(t => t.name.toLowerCase().includes('fbiad') || t.name.toLowerCase().includes('vakfı'));
    
    if (!fbiadTenant) {
        console.log("FBIAD Tenant bulunamadı.");
        process.exit(1);
    }

    const tenantId = fbiadTenant.id;
    console.log(`Tenant Bulundu: ${fbiadTenant.name} (${tenantId})`);

    // 2. Find Erhan Ayyıldız user
    const erhanUser = await db.query.users.findFirst({
        where: eq(users.email, 'erhanayyildiz@gmail.com')
    });
    
    if (!erhanUser) {
        console.log("Erhan Ayyıldız kullanıcısı bulunamadı.");
        process.exit(1);
    }

    // 3. Create or find FBIAD User
    const fbiadEmail = 'fbiad@burstabugun.com';
    let fbiadUser = await db.query.users.findFirst({
        where: eq(users.email, fbiadEmail)
    });

    if (!fbiadUser) {
        console.log("FBIAD User oluşturuluyor...");
        const result = await db.insert(users).values({
            tenantId: tenantId,
            fullName: 'FBİAD',
            email: fbiadEmail,
            password: crypto.randomBytes(16).toString('hex'), // random password
            isActive: true,
        }).returning();
        fbiadUser = result[0];
    } else {
        console.log("FBIAD User zaten mevcut.");
    }

    // 4. Ensure FBIAD User is in tenantUsers
    const tu = await db.query.tenantUsers.findFirst({
        where: and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, fbiadUser.id)
        )
    });

    if (!tu) {
        await db.insert(tenantUsers).values({
            tenantId: tenantId,
            userId: fbiadUser.id,
            role: 'sponsor',
            status: 'active'
        });
        console.log("FBIAD User tenant'a bağlandı.");
    }

    // 5. Find funds to transfer
    const fundsToTransfer = await db.query.funds.findMany({
        where: and(
            eq(funds.ownerId, erhanUser.id),
            eq(funds.tenantId, tenantId)
        )
    });

    // We only want to transfer the ones that were meant to be "Ortak Fon" / "Vakfa Havale/EFT"
    // Usually these are named something like "Ortak Fon" or have specific characteristics.
    // Let's print them first to verify
    for (const f of fundsToTransfer) {
        if (f.type === 'pool' || f.name.toLowerCase().includes('ortak') || f.name.toLowerCase().includes('havuz')) {
            console.log(`Transfer Ediliyor: ${f.name} (Type: ${f.type})`);
            await db.update(funds).set({ ownerId: fbiadUser.id }).where(eq(funds.id, f.id));
        }
    }

    console.log("İşlem tamamlandı!");
    process.exit(0);
}

main().catch(console.error);
