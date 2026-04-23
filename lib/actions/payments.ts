"use server";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markAsPaid(paymentIds: string[]) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    if (paymentIds.length > 0) {
        await db.update(payments)
            .set({
                status: 'completed',
                // optionally update paymentDate to now? 
                // typically we just leave it as the scheduled date or we can update it
            })
            .where(inArray(payments.id, paymentIds));
    }

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/payments/history");
    revalidatePath("/dashboard/payments/upcoming");
    return { success: true };
}

export async function removePayments(paymentIds: string[]) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    if (paymentIds.length > 0) {
        await db.update(payments)
            .set({ status: 'pending' })
            .where(inArray(payments.id, paymentIds));
    }

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/payments/upcoming");
    revalidatePath("/dashboard/payments/history");
    return { success: true };
}
