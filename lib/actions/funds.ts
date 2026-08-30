"use server";

import { db } from "@/lib/db";
import { funds, fundInvitations, users, fundContributors, fundSelections } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";

export async function createFund(data: {
    title: string;
    description: string;
    period: string;
    startDate: Date;
    endDate: Date;
    durationMonths: number;
    targetStudentCount: number;
    monthlyLimit?: number | null;
    paymentMethod?: string | null;
    photoUrl?: string | null;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const [newFund] = await db.insert(funds).values({
        tenantId: tenantData.tenantId,
        ownerId: tenantData.userId,
        title: data.title,
        description: data.description,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        durationMonths: data.durationMonths,
        targetStudentCount: data.targetStudentCount,
        paymentMethod: data.paymentMethod || 'monthly',
        monthlyLimit: data.monthlyLimit || null,
        photoUrl: data.photoUrl || null,
        isActive: true
    }).returning();

    const owner = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (owner && owner.email) {
        await db.insert(fundInvitations).values({
            fundId: newFund.id,
            inviterId: tenantData.userId,
            inviteeId: owner.id,
            inviteeEmail: owner.email,
            inviteePhone: owner.phoneNumber || null,
            inviteeName: owner.fullName,
            role: "bursveren",
            status: "accepted"
        });

        // Auto-add as contributor since they created it
        await db.insert(fundContributors).values({
            fundId: newFund.id,
            userId: owner.id,
            amount: data.monthlyLimit || 0,
            studentCount: data.targetStudentCount || 1,
            isActive: true
        });
    }

    revalidatePath("/dashboard/funds");

    return {
        success: true,
        fundId: newFund.id
    };
}

export async function increaseFundSponsorship(fundId: string, additionalCount: number) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    if (additionalCount <= 0) {
        throw new Error("Geçerli bir sayı giriniz.");
    }

    const availableSelections = await db.query.fundSelections.findMany({
        where: (fs, { and, eq, isNull }) => and(
            eq(fs.fundId, fundId),
            isNull(fs.sponsorId),
            eq(fs.isActive, true)
        ),
        orderBy: (fs, { asc }) => [asc(fs.createdAt)],
        limit: additionalCount
    });

    if (availableSelections.length < additionalCount) {
        throw new Error(`Sadece ${availableSelections.length} adet boşta öğrenci bulunmaktadır.`);
    }

    // 1. Assign students
    for (const sel of availableSelections) {
        await db.update(fundSelections)
            .set({ sponsorId: tenantData.userId })
            .where(eq(fundSelections.id, sel.id));
    }

    // 2. Update contributor count
    const existingContributor = await db.query.fundContributors.findFirst({
        where: (fc, { and, eq }) => and(
            eq(fc.fundId, fundId),
            eq(fc.userId, tenantData.userId)
        )
    });

    if (existingContributor) {
        await db.update(fundContributors)
            .set({ studentCount: (existingContributor.studentCount || 0) + additionalCount })
            .where(eq(fundContributors.id, existingContributor.id));
    } else {
        const fund = await db.query.funds.findFirst({ where: eq(funds.id, fundId) });
        await db.insert(fundContributors).values({
            fundId,
            userId: tenantData.userId,
            amount: fund?.monthlyLimit || 0,
            studentCount: additionalCount
        });
    }

    revalidatePath(`/dashboard/funds/${fundId}/payment`);
    revalidatePath(`/dashboard/funds`);
    
    return { success: true };
}

export async function toggleFundStatus(fundId: string, isActive: boolean) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        throw new Error("Yetkisiz işlem.");
    }

    await db.update(funds)
        .set({ isActive })
        .where(eq(funds.id, fundId));

    revalidatePath(`/dashboard/admin/funds/${fundId}`);
    revalidatePath(`/dashboard/admin/funds`);
    
    return { success: true };
}
