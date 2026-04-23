import { db } from "@/lib/db";
import { funds, fundSelections, applications, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Seeding payments for existing funds...");

    const allFunds = await db.query.funds.findMany();
    let count = 0;

    for (const fund of allFunds) {
        // Find selections for this fund
        const selections = await db.query.fundSelections.findMany({
            where: and(
                eq(fundSelections.fundId, fund.id),
                eq(fundSelections.isActive, true)
            )
        });

        if (selections.length > 0) {
            console.log(`Found ${selections.length} selections for fund ${fund.title}`);

            for (const sel of selections) {
                // Check if payments already exist for this selection
                const existingPayments = await db.query.payments.findMany({
                    where: and(
                        eq(payments.fundId, fund.id),
                        eq(payments.applicationId, sel.applicationId!)
                    )
                });

                if (existingPayments.length === 0) {
                    console.log(`Creating payments for application ${sel.applicationId}...`);

                    // We calculate duration as 3 for Muhsin Ayyıldız if null but let's be dynamic, default to 3
                    const duration = fund.durationMonths || 3;
                    const paymentRecords = [];
                    const monthlyAmount = fund.monthlyLimit || sel.amount || 2500;

                    const startD = fund.startDate ? new Date(fund.startDate) : new Date();

                    for (let i = 0; i < duration; i++) {
                        const currentPayDate = new Date(startD);
                        // Shift by 1 month for actual payment!
                        currentPayDate.setMonth(currentPayDate.getMonth() + i + 1);

                        const pMonth = currentPayDate.getMonth() + 1;
                        const pYear = currentPayDate.getFullYear();

                        paymentRecords.push({
                            tenantId: fund.tenantId,
                            fundId: fund.id,
                            applicationId: sel.applicationId,
                            amount: monthlyAmount,
                            status: 'pending' as const,
                            paymentDate: currentPayDate, // Scheduled date
                            notes: `${pMonth}/${pYear} Dönemi Ödemesi`,
                        });
                    }

                    if (paymentRecords.length > 0) {
                        await db.insert(payments).values(paymentRecords);
                        count += paymentRecords.length;
                    }
                } else {
                    console.log(`Payments already exist for application ${sel.applicationId}`);
                }
            }
        }
    }

    console.log(`Completed. Inserted ${count} payment records.`);
    return NextResponse.json({ success: true, count });
}
