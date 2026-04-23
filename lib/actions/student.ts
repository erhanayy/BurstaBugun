"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq } from "drizzle-orm";

export async function saveIban(ibanInfo: string, ibanName: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData) return { success: false, error: "Oturum bulunamadı" };

        let sanitized = ibanInfo.replace(/\s+/g, '').toUpperCase();
        if (sanitized && !sanitized.startsWith('TR')) {
            sanitized = 'TR' + sanitized;
        }

        await db.update(users)
            .set({ iban: sanitized, ibanName: ibanName })
            .where(eq(users.id, tenantData.userId));

        return { success: true };
    } catch (error: any) {
        console.error("Save IBAN error:", error);
        return { success: false, error: "Kaydedilirken bir hata oluştu." };
    }
}
