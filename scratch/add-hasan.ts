import { db } from "../lib/db";
import { users, funds, fundContributors, payments, tenantUsers } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function main() {
    const name = "Hasan Çolakoğlu";
    const amount = 27500;
    
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2025-2026 FBIAD%')
    });
    
    if (!fund) {
        console.log("Error: Fund not found!");
        process.exit(1);
    }
    
    const tenantId = fund.tenantId;

    let targetUserId = null;
    let dbUser = await db.query.users.findFirst({
        where: ilike(users.fullName, name)
    });
    
    if (dbUser) {
        targetUserId = dbUser.id;
        console.log(`Found existing user: ${name}`);
    } else {
        targetUserId = uuidv4();
        const targetUserEmail = `hasan.colakoglu@eski.fbiad.org`;
        
        await db.insert(users).values({
            id: targetUserId,
            tenantId: tenantId,
            email: targetUserEmail,
            fullName: name,
            phoneNumber: '0000000000', // Dummy phone
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
        console.log(`Created dummy user: ${name}`);
    }
    
    // Add to fundContributors
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
            amount: amount,
            studentCount: 0,
            supporterType: 'one_time',
            isPaid: true,
            isActive: true,
            createdAt: new Date(new Date().setFullYear(2025))
        });
        console.log("Added to fundContributors");
    }
    
    // Add to payments
    await db.insert(payments).values({
        id: uuidv4(),
        tenantId: tenantId,
        fundId: fund.id,
        userId: targetUserId,
        amount: amount,
        status: 'completed',
        paymentMethod: 'wire_transfer',
        paymentDate: new Date(new Date().setFullYear(2025)),
        notes: '2025-2026 Sezonu Eksik Tamamlama Bağışı',
        createdAt: new Date(new Date().setFullYear(2025))
    });
    console.log("Added payment of", amount);

    process.exit(0);
}
main();
