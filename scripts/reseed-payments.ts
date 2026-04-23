import { db } from "../lib/db";
import { funds, fundSelections, applications, payments } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    console.log("Deleting old generated payments...");
    await db.delete(payments);

    console.log("Reseeding payments for existing funds with new logic...");

    const allFunds = await db.query.funds.findMany();
    let count = 0;

    for (const fund of allFunds) {
        const selections = await db.query.fundSelections.findMany({
            where: and(
                eq(fundSelections.fundId, fund.id),
                eq(fundSelections.isActive, true)
            )
        });

        if (selections.length > 0) {
            console.log(`Found ${selections.length} selections for fund ${fund.title}`);

            for (const sel of selections) {
                const duration = fund.durationMonths || 3;
                const paymentRecords: any[] = [];
                const monthlyAmount = fund.monthlyLimit || sel.amount || 2500;

                const startD = fund.startDate ? new Date(fund.startDate) : new Date();

                for (let i = 0; i < duration; i++) {
                    const currentPayDate = new Date(startD);
                    // New Logic: +2 months, 1st day of month
                    currentPayDate.setMonth(currentPayDate.getMonth() + i + 2);
                    currentPayDate.setDate(1);

                    const pMonth = currentPayDate.getMonth() + 1;
                    const pYear = currentPayDate.getFullYear();

                    paymentRecords.push({
                        tenantId: fund.tenantId,
                        fundId: fund.id,
                        applicationId: sel.applicationId,
                        amount: monthlyAmount,
                        status: 'pending' as const,
                        paymentDate: currentPayDate,
                        notes: `${pMonth}/${pYear} Dönemi Ödemesi`,
                    });
                }

                if (paymentRecords.length > 0) {
                    await db.insert(payments).values(paymentRecords);
                    count += paymentRecords.length;
                    console.log(`Created ${paymentRecords.length} payments for application ${sel.applicationId}.`);
                }
            }
        }
    }

    console.log(`Completed. Inserted ${count} payment records.`);
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
