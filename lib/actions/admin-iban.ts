"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { createNotification } from "./notification";
import { sendEmail, EMAIL_CODES } from "@/lib/email";

export async function sendIbanReminder(studentUserId: string, period: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkiniz yok." };
        }

        const student = await db.query.users.findFirst({
            where: eq(users.id, studentUserId)
        });

        if (!student) {
            return { success: false, error: "Öğrenci bulunamadı." };
        }

        const messageBody = `Sayın ${student.fullName || 'Öğrenci'}, ${period} dönemi için fona seçildiniz. Burs gönderimi için sistem üzerinden IBAN bilgilerinizi girmeniz gerekmektedir.`;
        
        // Uygulama içi bildirim gönder
        await createNotification(
            tenantData.tenantId,
            [student.id],
            'system',
            'IBAN Bilgisi Eksik',
            messageBody,
            '/dashboard/iban'
        );

        // Email gönder
        if (student.email) {
            await sendEmail({
                code: EMAIL_CODES.BILDIRIM,
                sentTo: student.email,
                subject: 'Bursta Bugün - IBAN Bilgisi Hatırlatması',
                body: `<p>${messageBody}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.dernektebugun.com'}/dashboard/iban">IBAN Bilgilerinizi Girmek İçin Tıklayın</a></p>`,
                screen: 'admin/iban-list'
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("sendIbanReminder error:", error);
        return { success: false, error: "Hatırlatma gönderilirken bir hata oluştu." };
    }
}
