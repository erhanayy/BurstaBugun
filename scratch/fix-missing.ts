import { db } from "../lib/db";
import { users, applications, fundSelections, funds } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function main() {
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2025-2026 FBIAD%')
    });
    const seasonId = 'b22c682a-546b-4cbf-acdd-d432e9110cb6';
    const tenantId = fund.tenantId;

    const targets = [
        { name: 'Aleyna Gül GÜRSOY', phone: '5510320732' },
        { name: 'Kevser EŞREFOĞLU', email: 'kevseresrefoglu@gmail.com' },
        { name: 'Nilay AKBULUT', email: 'akbulutnilaytr@gmail.com' },
        { name: 'Zeynep ÇAKMAK', email: 'zeynepcakmak800@gmail.com' },
        { name: 'Nilay Bahadır', email: 'nilaybahadirrr1@gmail.com' }
    ];
    
    for (const t of targets) {
        let dbUser;
        if (t.email) {
            dbUser = await db.query.users.findFirst({ where: ilike(users.email, t.email) });
        } else {
            dbUser = await db.query.users.findFirst({ where: ilike(users.phoneNumber, `%${t.phone}%`) });
        }
        
        if (!dbUser) {
            console.log("NOT FOUND IN DB:", t.name);
            continue;
        }

        const existingApp = await db.query.applications.findFirst({
            where: (applications, { eq, and }) => and(
                eq(applications.userId, dbUser.id),
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
                userId: dbUser.id,
                period: seasonId,
                status: 'active',
                fundId: fund.id,
                appliedAt: new Date(new Date().setFullYear(2025))
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
                amount: 4000,
                paymentType: 'monthly',
                createdAt: new Date(new Date().setFullYear(2025))
            });
            console.log(`Added ${t.name} to fundSelections!`);
        } else {
            console.log(`${t.name} already in fundSelections.`);
        }
    }

    process.exit(0);
}
main();
