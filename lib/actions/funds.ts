"use server";

import { db } from "@/lib/db";
import { funds } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

export async function createFund(data: {
    title: string;
    description: string;
    period: string;
    startDate: Date;
    endDate: Date;
    durationMonths: number;
    targetStudentCount: number;
    monthlyLimit?: number | null;
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
        monthlyLimit: data.monthlyLimit || null,
        photoUrl: data.photoUrl || null,
        isActive: true
    }).returning();

    revalidatePath("/dashboard/funds");

    return {
        success: true,
        fundId: newFund.id
    };
}
