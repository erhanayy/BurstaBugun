"use server";

import { db } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

export async function updateDonationStatus(donationId: number, status: 'completed' | 'failed' | 'pending') {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return { success: false, error: "Yetkisiz işlem." };
    }

    try {
        await db.update(donations)
            .set({ status })
            .where(
                and(
                    eq(donations.id, donationId),
                    eq(donations.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/donations");
        return { success: true };
    } catch (error: any) {
        console.error("updateDonationStatus error:", error);
        return { success: false, error: "İşlem sırasında bir hata oluştu." };
    }
}
