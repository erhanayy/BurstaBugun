import { db } from "../lib/db";
import { users, funds, applications, fundSelections, tenantUsers } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const csvData = `2024-2025,Aleyna Gül GÜRSOY,0090 551 032 0732,Evet
2024-2025,Arda DOĞAN,0090 530 113 0744,Evet
2024-2025,Asya Nur KARABİBER,0090 505 388 3705,Evet
2024-2025,AYŞE YILMAZ,0090 552 836 3817,Evet
2024-2025,Başak SARPKAYA,,Hayır
2024-2025,Begüm ŞAHİN,,Hayır
2024-2025,Berfin ŞİMŞEK,0090 541 199 9569,Evet
2024-2025,Buse Uğur,0090 539 372 8560,Evet
2024-2025,Büşra YİRMİBEŞ,0090 539 890 2796,Evet
2024-2025,Cemile KESKİN,,Hayır
2024-2025,CEYDA KAYMAK,0090 538 747 6143,Evet
2024-2025,Cumali KAYA,0090 544 405 7113,Evet
2024-2025,Deniz ÇETİN,0090 541 734 8930,Evet
2024-2025,Dilara Ebrar FİDAN,,Hayır
2024-2025,Doluay BATMAZ,0090 530 279 7695,Evet
2024-2025,Efe FİLAZİOĞLU,,Hayır
2024-2025,Elif Tuğçe KAYA,,Hayır
2024-2025,Erengül Büşra ÇAĞAN,0090 539 950 8973,Evet
2024-2025,Evin Darılmaz,0090 531 356 0127,Evet
2024-2025,Gözde GÖLÇEK,,Hayır
2024-2025,Güler Seda AKNARCI,,Hayır
2024-2025,Gülsüm Uğur,,Hayır
2024-2025,Gülşah GÖY,0090 531 863 6185,Evet
2024-2025,HAMZA İNAL,,Hayır
2024-2025,Hatice KAPKINER,0090 505 675 7406,Evet
2024-2025,İlknur BARANER,,Hayır
2024-2025,Jibril YAHUZA,0090 542 104 7242,Evet
2024-2025,Kevser EŞREFOĞLU,0090 555 071 6016,Evet
2024-2025,MAKBULE SEVİNTİ,0090 552 8283409,Evet
2024-2025,Merve uysal,0090 501 125 4102,Evet
2024-2025,Muhammed Raşit BULUT,,Hayır
2024-2025,Nilay AKBULUT,0090 534 920 9046,Evet
2024-2025,Nisanur YILDIRIM,0090 541 260 7795,Evet
2024-2025,Özlem KAYMAK,,Hayır
2024-2025,Rabia AKÇAY,0090 541 147 8720,Evet
2024-2025,Rümeysa BULUT,,Hayır
2024-2025,Sıla KÖSE,0090 553 886 2702,Evet
2024-2025,Sıla özdemir,0090 544 575 2523,Evet
2024-2025,Suna TAŞKIN,0090 534 245 4016,Evet
2024-2025,Şevval KESKİN,,Hayır
2024-2025,Tuana YILDIZ,0090 546 580 6210,Evet
2024-2025,Tülin MERT,,Hayır
2024-2025,Umut FİLAZİOĞLU,,Hayır
2024-2025,Vahide Çabukel,0090 546 482 0921,Evet
2024-2025,Yağmur AVCI,0090 546 858 4516,Evet
2024-2025,Yağmur İNCE,,Hayır
2024-2025,Yağmur ÖZDOĞAN,0090 551 001 2969,Evet
2024-2025,YUSUF EFE ŞAHİN,,Hayır
2024-2025,Zeynep ÇAKMAK,0090 551 014 4592,Evet
2024-2025,Zeynep YÜCETAŞ,,Hayır`;

function normalizePhone(p: string) {
    if (!p) return '';
    return p.replace(/[\s-]/g, '').replace(/^0090/, '').replace(/^\+90/, '').replace(/^0/, '');
}

async function main() {
    const lines = csvData.trim().split('\n');
    const dbUsers = await db.query.users.findMany();
    
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2024-2025 FBIAD%')
    });
    
    if (!fund) {
        console.log("Error: 2024-2025 FBIAD Fonu not found!");
        process.exit(1);
    }
    
    const seasonId = '1233ad95-d209-454b-b502-f1c874cd56ef';
    const tenantId = fund.tenantId;

    let selectedCount = 0;
    
    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 4) continue;
        const name = parts[1].trim();
        const rawPhone = parts[2].trim();
        const phone = normalizePhone(rawPhone);
        
        let targetUserId = null;
        
        let found = dbUsers.find(u => {
            const up = u.phoneNumber ? normalizePhone(u.phoneNumber) : '';
            return (phone && up === phone) || u.fullName.toLowerCase() === name.toLowerCase();
        });

        if (found) {
            targetUserId = found.id;
        } else {
            targetUserId = uuidv4();
            const targetUserEmail = `${name.replace(/\s+/g, '.').replace(/[ıiğüşöçIİĞÜŞÖÇ]/g, 'x').toLowerCase()}@eski.fbiad.org`;
            // generate a fake phone that is unique
            const fakePhone = `00000000${selectedCount}`.slice(-10);
            
            await db.insert(users).values({
                id: targetUserId,
                tenantId: tenantId,
                email: targetUserEmail,
                fullName: name,
                phoneNumber: rawPhone ? rawPhone : fakePhone,
                password: 'password123',
            });
            
            await db.insert(tenantUsers).values({
                id: uuidv4(),
                tenantId: tenantId,
                userId: targetUserId,
                role: 'applicant',
                isActive: true,
                joinedAt: new Date()
            });
            console.log(`Created dummy user: ${name}`);
        }
        
        if (!targetUserId) continue;

        // Check if application already exists
        const existingApp = await db.query.applications.findFirst({
            where: (applications, { eq, and }) => and(
                eq(applications.userId, targetUserId),
                eq(applications.period, seasonId)
            )
        });
        
        let appId = null;
        if (existingApp) {
            appId = existingApp.id;
            await db.update(applications)
                .set({ status: 'active', fundId: fund.id })
                .where(eq(applications.id, appId));
        } else {
            appId = uuidv4();
            await db.insert(applications).values({
                id: appId,
                tenantId: tenantId,
                userId: targetUserId,
                period: seasonId,
                status: 'active',
                fundId: fund.id,
                appliedAt: new Date(new Date().setFullYear(2024))
            });
        }

        const existingSel = await db.query.fundSelections.findFirst({
            where: (fundSelections, { eq, and }) => and(
                eq(fundSelections.applicationId, appId),
                eq(fundSelections.fundId, fund.id)
            )
        });
        
        if (!existingSel) {
            await db.insert(fundSelections).values({
                id: uuidv4(),
                fundId: fund.id,
                applicationId: appId,
                isActive: true,
                amount: 2500,
                paymentType: 'monthly',
                createdAt: new Date(new Date().setFullYear(2024))
            });
        }
        
        console.log(`Processed ${name} -> Application ${appId}`);
        selectedCount++;
    }

    console.log(`Migration complete! Successfully added ${selectedCount} students to 2024-2025 FBİAD Fonu.`);
    process.exit(0);
}
main();
