"use server";

import { db } from "../db";
import { users, applications } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "../tenant";
import { revalidatePath } from "next/cache";

export async function saveBankInfo(formData: FormData) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: 'Oturum bulunamadı' };
    
    // Yalnızca havuza alınmış (pool) veya fona seçilmiş (active) öğrencilerin IBAN girmesine izin var.
    const userApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenantData.userId),
            eq(applications.tenantId, tenantData.tenantId)
        )
    });

    if (!userApplication) {
        return { success: false, error: 'Burs başvurunuz bulunamadı.' };
    }

    if (userApplication.status !== 'pool' && userApplication.status !== 'active') {
        return { success: false, error: 'Sadece havuza seçilen veya bursiyer olan öğrenciler IBAN girebilir.' };
    }

    const ibanName = formData.get("ibanName")?.toString().trim();
    const iban = formData.get("iban")?.toString().trim().replace(/\s+/g, ''); // Boşlukları temizle

    if (!ibanName || !iban) {
        return { success: false, error: 'Lütfen Alıcı Adı ve IBAN bilgilerini eksiksiz doldurun.' };
    }

    if (!iban.startsWith("TR") || iban.length !== 26) {
        return { success: false, error: 'Geçersiz IBAN formatı. IBAN TR ile başlamalı ve 26 karakter uzunluğunda olmalıdır.' };
    }

    try {
        await db.update(users)
            .set({ 
                ibanName: ibanName.toUpperCase(),
                iban: iban
            })
            .where(eq(users.id, tenantData.userId));

        revalidatePath('/dashboard/settings/bank');
        return { success: true, message: 'Banka bilgileriniz başarıyla kaydedildi.' };
    } catch (error) {
        console.error("IBAN kaydetme hatası:", error);
        return { success: false, error: 'Banka bilgileri kaydedilirken bir hata oluştu.' };
    }
}
