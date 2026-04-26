"use server";

import { db } from "@/lib/db";
import { funds, fundInvitations, users } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

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
            status: "pending"
        });
    }

    revalidatePath("/dashboard/funds");

    return {
        success: true,
        fundId: newFund.id
    };
}
