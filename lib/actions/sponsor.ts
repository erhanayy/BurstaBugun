"use server";

import { db } from "@/lib/db";
import { applications, funds, fundSelections, fundContributors, payments } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSponsorFunds() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const ownedFunds = await db.query.funds.findMany({
        where: eq(funds.ownerId, tenantData.userId),
        with: {
            contributors: true,
            selections: { where: eq(fundSelections.isActive, true) },
            invitations: true
        },
        orderBy: (funds, { desc }) => [desc(funds.createdAt)],
    });

    const contributed = await db.query.fundContributors.findMany({
        where: eq(fundContributors.userId, tenantData.userId),
        with: {
            fund: {
                with: {
                    contributors: true,
                    selections: { where: eq(fundSelections.isActive, true) },
                    invitations: true
                }
            }
        }
    });

    const fundsMap = new Map();
    ownedFunds.forEach(f => fundsMap.set(f.id, f));
    contributed.forEach(c => fundsMap.set(c.fund.id, c.fund));

    return Array.from(fundsMap.values()).sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
    });
}

export async function getApplicationPool() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const myFunds = await getSponsorFunds();
    if (myFunds.length === 0) return [];

    const fundIds = myFunds.map(f => f.id);

    return await db.query.applications.findMany({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            eq(applications.status, 'in_pool')
        ),
        with: {
            fund: true,
            user: true,
            form: true,
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)],
    });
}

export async function selectBursiyer(applicationId: string, fundId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const fundObj = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });
    if (!fundObj) throw new Error("Fon bulunamadı.");

    // Check capacity
    const currentSelections = await db.query.fundSelections.findMany({
        where: and(
            eq(fundSelections.fundId, fundId),
            eq(fundSelections.isActive, true)
        )
    });

    if (fundObj.targetStudentCount !== null && currentSelections.length >= fundObj.targetStudentCount) {
        throw new Error(`Bu fon tamamen dolmuştur! Belirlenen kapasite (${fundObj.targetStudentCount} kişi) aşılmış olduğu için havuza yeni kişi seçemezsiniz.`);
    }

    const existingSelection = await db.query.fundSelections.findFirst({
        where: and(
            eq(fundSelections.applicationId, applicationId),
            eq(fundSelections.fundId, fundId)
        )
    });

    if (existingSelection) {
        throw new Error("Bu başvuruyu zaten seçtiniz.");
    }

    await db.insert(fundSelections).values({
        fundId: fundId,
        applicationId: applicationId,
        amount: fundObj.monthlyLimit || 0,
        paymentType: 'one_time',
    });

    // Update application status
    await db.update(applications)
        .set({ status: 'selected', fundId: fundId })
        .where(eq(applications.id, applicationId));

    // Calculate duration strictly
    let finalDuration = fundObj.durationMonths;
    if (!finalDuration && fundObj.startDate && fundObj.endDate) {
        // Fallback calculation manually or just rely on months
        const m1 = fundObj.startDate.getFullYear() * 12 + fundObj.startDate.getMonth();
        const m2 = fundObj.endDate.getFullYear() * 12 + fundObj.endDate.getMonth();
        finalDuration = Math.max(1, m2 - m1);
    }

    // Generate Payment Orders automatically
    if (finalDuration && finalDuration > 0 && fundObj.startDate) {
        const paymentRecords = [];
        const monthlyAmount = fundObj.monthlyLimit || 0;

        for (let i = 0; i < finalDuration; i++) {
            const currentPayDate = new Date(fundObj.startDate);
            // 18 Nisan start -> Mayis kart çekimi -> Haziran 1 odeme (Start month + 2, day 1)
            currentPayDate.setMonth(currentPayDate.getMonth() + i + 2);
            currentPayDate.setDate(1);

            const pMonth = currentPayDate.getMonth() + 1;
            const pYear = currentPayDate.getFullYear();

            paymentRecords.push({
                tenantId: tenantData.tenantId,
                fundId,
                applicationId,
                amount: monthlyAmount,
                status: 'pending' as const,
                paymentDate: currentPayDate, // Scheduled date
                notes: `${pMonth}/${pYear} Dönemi Ödemesi`, // Note for timeline alignment!
            });
        }

        if (paymentRecords.length > 0) {
            await db.insert(payments).values(paymentRecords);
        }
    }

    revalidatePath("/dashboard/pool");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/payments/upcoming");
}
