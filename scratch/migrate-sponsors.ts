import { db } from "../lib/db";
import { users, funds, fundContributors, payments, tenantUsers, studentPaymentLogs, applications } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const csvData = `2025-2026,ADEM YAŞAR,0090 535 384 05 19,1
2025-2026,Ahmet Ali Kocataş,0090 532 593 52 55,1
2025-2026,Ali Onaran,0090 532 211 80 68,5
2025-2026,Alper Gerdaneri,0090 532 414 59 29,1
2025-2026,Aykut Otu,0090 532 663 55 03,1
2025-2026,BAYRAM MERAL,0090 542 785 21 16,1
2025-2026,Binnur Sarcan,0090 530 063 94 99,1
2025-2026,BURAK ÖZHAN,0090 542 730 05 42,1
2025-2026,CAFER IŞIK,0090 537 231 40 55,1
2025-2026,Cem Nedim Yıldırım,00420 776 867 423,1
2025-2026,CEMİL ERDOĞAN,0090 507 145 85 45,1
2025-2026,Emir Özalpay,0090 530 939 37 07,2
2025-2026,Emre Salih,0090 532 120 33 21,1
2025-2026,Emre Yeşilyurt,0090 532 362 25 79,5
2025-2026,Emre Zeylan,0090 532 766 80 25,1
2025-2026,Emrullah Çobaner,0090 532 555 09 00,1
2025-2026,Enver Osmanoğlu,0090 532 286 66 47,1
2025-2026,Erdinç Karakuş,0090 532 357 89 17,1
2025-2026,Erhan Ayyılıdz,0090 530 514 60 33,1
2025-2026,FAHRETTİN CEYLAN,0090 553 209 27 27,1
2025-2026,Fatih Serhat Yılmış,0090 555 246 10 91,1
2025-2026,Gökhan Bolluk,0090 533 655 16 02,1
2025-2026,GÖKHAN KESİCİ,0090 546 252 06 53,1
2025-2026,GÖKHAN SİPAHİ,0090 555 455 28 54,1
2025-2026,Gökmen Aydeyer - Gülüş atölyesi diş,0090 544 388 89 02,1
2025-2026,Hakan Yılmaz Mavkan,0090 532 243 74 09,1
2025-2026,Halit Yazcicek,0090 533 265 93 65,1
2025-2026,HASAN YILMAZ,0090 544 324 50 04,2
2025-2026,MAHMUD ALTUNDEMİR,0090 531 978 16 74,1
2025-2026,Mehmet Kadir Özbey,0090 507 101 25 25,2
2025-2026,Meriç Çağlayan,0090 532 276 96 61,2
2025-2026,Mete Aktaş,0090 532 787 32 77,1
2025-2026,Mustafa Şenel,0090 533 502 92 02,1
2025-2026,Ogun Doğan,0090 532 384 00 88,5
2025-2026,Onur Kırcali,0090 533 397 25 19,1
2025-2026,OSMAN DEMİRCAN,0090 555 237 25 46,1
2025-2026,Osman Demirel,0090 536 497 43 06,1
2025-2026,OSMAN KÜRŞAT KARAMAN,0090 554 981 12 90,1
2025-2026,Selin Başaran,0090 532 555 03 05,1
2025-2026,Şadi Ergün,0090 531 568 74 40,2
2025-2026,ŞAHİN LEVENT KÖSE,0090 532 417 67 87,1
2025-2026,Tarık Ziya Barut - 3dem proje,0090 505 935 75 82,1
2025-2026,Tuba İşler,0090 551 486 19 07,1
2025-2026,Ufuk Emir,0090 541 410 11 32,2
2025-2026,UTKU TAŞDELEN,0090 507 488 19 94,1
2025-2026,YAHYA KARA,0090 542 833 33 33,1
2025-2026,YAKUP IŞIKLAR,0049 173 2430400,2
2025-2026,YUNUS ŞAHİN,0090 532 163 43 77,1`;

function normalizePhone(p: string) {
    return p.replace(/[\s-]/g, '').replace(/^0090/, '').replace(/^\+90/, '').replace(/^0049/, '').replace(/^0/, '');
}

async function main() {
    const lines = csvData.trim().split('\n');
    const dbUsers = await db.query.users.findMany();
    
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2025-2026 FBIAD%')
    });
    
    if (!fund) {
        console.log("Error: 2025-2026 FBIAD Fonu not found!");
        process.exit(1);
    }
    
    const tenantId = fund.tenantId;

    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 4) continue;
        const name = parts[1].trim();
        const phoneRaw = parts[2].trim();
        const studentCount = parseInt(parts[3].trim());

        const phone = normalizePhone(phoneRaw);
        
        let targetUserId = null;
        
        let found = dbUsers.find(u => {
            const up = u.phoneNumber ? normalizePhone(u.phoneNumber) : '';
            return up === phone || u.fullName.toLowerCase() === name.toLowerCase();
        });

        if (found) {
            targetUserId = found.id;
        } else {
            targetUserId = uuidv4();
            const targetUserEmail = `${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@eski.fbiad.org`;
            
            await db.insert(users).values({
                id: targetUserId,
                tenantId: tenantId,
                email: targetUserEmail,
                fullName: name,
                phoneNumber: phoneRaw,
                password: 'password123'
            });
            
            await db.insert(tenantUsers).values({
                id: uuidv4(),
                tenantId: tenantId,
                userId: targetUserId,
                role: 'sponsor',
                isActive: true,
                joinedAt: new Date()
            });
            console.log(`Created dummy sponsor: ${name}`);
        }
        
        const totalAmount = studentCount * 40000;
        
        // 1. Add to fundContributors
        const existingContrib = await db.query.fundContributors.findFirst({
            where: (fundContributors, { eq, and }) => and(
                eq(fundContributors.fundId, fund.id),
                eq(fundContributors.userId, targetUserId)
            )
        });
        
        if (!existingContrib) {
            await db.insert(fundContributors).values({
                id: uuidv4(),
                fundId: fund.id,
                userId: targetUserId,
                amount: totalAmount,
                studentCount: studentCount,
                supporterType: 'recurring',
                isPaid: true,
                isActive: true,
                createdAt: new Date(new Date().setFullYear(2025))
            });
        }
        
        // 2. Add to payments
        await db.insert(payments).values({
            id: uuidv4(),
            tenantId: tenantId,
            fundId: fund.id,
            userId: targetUserId,
            amount: totalAmount,
            status: 'completed',
            paymentMethod: 'wire_transfer',
            paymentDate: new Date(new Date().setFullYear(2025)),
            notes: '2025-2026 Sezonu Toplam Bağışı',
            createdAt: new Date(new Date().setFullYear(2025))
        });
        
        console.log(`Processed sponsor ${name} -> Amount: ${totalAmount}`);
    }

    // 3. Create studentPaymentLogs for all 67 students
    const seasonId = 'b22c682a-546b-4cbf-acdd-d432e9110cb6';
    const studentsInFund = await db.query.applications.findMany({
        where: (applications, { eq, and }) => and(
            eq(applications.fundId, fund.id),
            eq(applications.period, seasonId)
        )
    });
    
    console.log(`Found ${studentsInFund.length} students in the fund. Creating payment logs...`);
    
    for (const app of studentsInFund) {
        await db.insert(studentPaymentLogs).values({
            id: uuidv4(),
            tenantId: tenantId,
            applicationId: app.id,
            fundId: fund.id,
            amount: 40000,
            paymentDate: new Date(new Date().setFullYear(2025)),
            notes: '2025-2026 Sezonu Toplam Bursu',
            createdAt: new Date(new Date().setFullYear(2025))
        });
    }

    console.log("Migration complete!");
    process.exit(0);
}
main();
