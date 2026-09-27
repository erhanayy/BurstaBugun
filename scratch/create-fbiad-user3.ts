import { db } from "../lib/db";
import { users, tenantUsers, funds, tenants } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

async function main() {
    // 2. Find Erhan Ayyıldız user
    const erhanUser = await db.query.users.findFirst({
        where: eq(users.email, 'erhanayyildiz@gmail.com')
    });
    
    if (!erhanUser) {
        console.log("Erhan Ayyıldız kullanıcısı bulunamadı.");
        process.exit(1);
    }
    
    const tenantId = erhanUser.tenantId;
    console.log(`Tenant ID: ${tenantId}`);

    // 3. Create or find FBIAD User
    const fbiadEmail = 'fbiad@fbiad.org'; // FBIAD tenant's logical admin email
    let fbiadUser = await db.query.users.findFirst({
        where: eq(users.email, fbiadEmail)
    });

    if (!fbiadUser) {
        console.log("FBIAD User oluşturuluyor...");
        const result = await db.insert(users).values({
            tenantId: tenantId,
            fullName: 'FBİAD',
            email: fbiadEmail,
            phoneNumber: '00000000000',
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
            eq(funds.tenantId, tenantId),
            eq(funds.type, 'pool') // pool = Havale/EFT type usually
        )
    });

    for (const f of fundsToTransfer) {
        console.log(`Transfer Ediliyor: ${f.name} (Type: ${f.type})`);
        await db.update(funds).set({ ownerId: fbiadUser.id }).where(eq(funds.id, f.id));
    }

    console.log("İşlem tamamlandı!");
    process.exit(0);
}

main().catch(console.error);
