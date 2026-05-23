"use server";

import { db } from "@/lib/db";
import { parametersTenantSeasons } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSeason(data: {
    period: string;
    appStartDate: Date | null;
    appEndDate: Date | null;
    fundStartDate: Date | null;
    fundEndDate: Date | null;
    defaultFundAmount: number | null;
    defaultFundDuration: number | null;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') {
        throw new Error("Yetkisiz işlem.");
    }

    await db.insert(parametersTenantSeasons).values({
        tenantId: tenantData.tenantId,
        period: data.period,
        appStartDate: data.appStartDate,
        appEndDate: data.appEndDate,
        fundStartDate: data.fundStartDate,
        fundEndDate: data.fundEndDate,
        defaultFundAmount: data.defaultFundAmount,
        defaultFundDuration: data.defaultFundDuration,
        isActive: true,
    });

    revalidatePath("/dashboard/admin/parameters");
    return { success: true };
}

export async function toggleSeasonStatus(seasonId: string, isActive: boolean) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') {
        throw new Error("Yetkisiz işlem.");
    }

    await db.update(parametersTenantSeasons)
        .set({ isActive })
        .where(and(eq(parametersTenantSeasons.id, seasonId), eq(parametersTenantSeasons.tenantId, tenantData.tenantId)));

    revalidatePath("/dashboard/admin/parameters");
    return { success: true };
}

export async function deleteSeason(seasonId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') {
        throw new Error("Yetkisiz işlem.");
    }

    await db.delete(parametersTenantSeasons)
        .where(and(eq(parametersTenantSeasons.id, seasonId), eq(parametersTenantSeasons.tenantId, tenantData.tenantId)));

    revalidatePath("/dashboard/admin/parameters");
    return { success: true };
}
