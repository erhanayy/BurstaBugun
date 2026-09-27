import { db } from "../lib/db";
import { users, funds, fundContributors, payments, tenantUsers, studentPaymentLogs, applications } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const csvData = `2024-2025,Ahmet Ali Kocataş,0090 532 593 52 55,1
2024-2025,Ali Onaran,0090 532 211 80 68,1
2024-2025,Alper Gerdaneri,0090 532 414 59 29,1
2024-2025,Alper Koç,0090 532 420 64 84,1
2024-2025,Aykut Otu,0090 532 663 55 03,1
2024-2025,Binnur Sarcan,0090 530 063 94 99,1
2024-2025,Cem Nedim Yıldırım,00420 776 867 423,1
2024-2025,Dağcan Marangoz,0090 533 690 13 90,2
2024-2025,Emir Özalpay,0090 530 939 37 07,3
2024-2025,Emre Yeşilyurt,0090 532 362 25 79,4
2024-2025,Emre Zeylan,0090 532 766 80 25,1
2024-2025,Enver Osmanoğlu,0090 532 286 66 47,1
2024-2025,Erdinç Karakuş,0090 532 357 89 17,1
2024-2025,Erhan Ayyılıdz,0090 530 514 60 33,1
2024-2025,Gökhan Bolluk,0090 533 655 16 02,1
2024-2025,Gökmen Aydeyer - Gülüş atölyesi diş,0090 544 388 89 02,1
2024-2025,Güven Güleşce,0090 532 300 19 07,1
2024-2025,Hakan Yılmaz Mavkan,0090 532 243 74 09,1
2024-2025,Halit Yazcicek,0090 533 265 93 65,1
2024-2025,Hasan Bünül,001 610 864 12 10,5
2024-2025,Mehmet Kadir Özbey,0090 507 101 25 25,2
2024-2025,Meriç Çağlayan,0090 532 276 96 61,2
2024-2025,Mete Aktaş,0090 532 787 32 77,1
2024-2025,Mustafa Şenel,0090 533 502 92 02,1
2024-2025,Ogun Doğan,0090 532 384 00 88,1
2024-2025,Onur Kırcali,0090 533 397 25 19,1
2024-2025,Osman Demirel,0090 536 497 43 06,1
2024-2025,Saygın Özyıldırım,0090 532 243 79 24,5
2024-2025,Selin Başaran,0090 532 555 03 05,1
2024-2025,Serhat Yılmış,0090 555 246 10 91,1
2024-2025,Sinan Sungur,00998 94 885 00 49,2
2024-2025,Tarık Ziya Barut - 3dem proje,0090 505 935 75 82,1
2024-2025,Tuba İşler,0090 551 486 19 07,1`;

function normalizePhone(p: string) {
    if (!p) return '';
    return p.replace(/[\s-]/g, '').replace(/^0090/, '').replace(/^\+90/, '').replace(/^0049/, '').replace(/^00420/, '').replace(/^001/, '').replace(/^00998/, '').replace(/^0/, '');
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
    
    const tenantId = fund.tenantId;

    let selectedCount = 0;
    
    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 4) continue;
        const name = parts[1].trim();
        const rawPhone = parts[2].trim();
        const studentCount = parseInt(parts[3].trim());

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
            const targetUserEmail = `${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@eski.fbiad.org`;
            
            await db.insert(users).values({
                id: targetUserId,
                tenantId: tenantId,
                email: targetUserEmail,
                fullName: name,
                phoneNumber: rawPhone,
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
        
        const totalAmount = studentCount * 25000;
        
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
                createdAt: new Date(new Date().setFullYear(2024))
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
            paymentDate: new Date(new Date().setFullYear(2024)),
            notes: '2024-2025 Sezonu Toplam Bağışı',
            createdAt: new Date(new Date().setFullYear(2024))
        });
        
        console.log(`Processed sponsor ${name} -> Amount: ${totalAmount}`);
    }

    // 3. Create studentPaymentLogs for all 50 students
    const seasonId = '1233ad95-d209-454b-b502-f1c874cd56ef';
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
            amount: 25000,
            paymentDate: new Date(new Date().setFullYear(2024)),
            notes: '2024-2025 Sezonu Toplam Bursu',
            createdAt: new Date(new Date().setFullYear(2024))
        });
    }

    console.log("Migration complete!");
    process.exit(0);
}
main();
