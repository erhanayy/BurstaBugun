"use server";

import { db } from "@/lib/db";
import { applications, references, users } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notification";
import { sendEmail, EMAIL_CODES } from "@/lib/email";

export async function addReference(applicationId: string, email: string, fullName: string, title: "muhtar" | "teacher" | "other") {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    // Mevcut öğrencinin başvurusunu kontrol et
    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        ),
        with: { user: true }
    });

    if (!app) throw new Error("Başvuru bulunamadı veya yetkiniz yok.");

    // Aynı kişiyi ikinci kez eklemeyi engelle
    const existing = await db.query.references.findFirst({
        where: and(
            eq(references.applicationId, applicationId),
            eq(references.email, email.trim().toLowerCase())
        )
    });

    if (existing) {
        throw new Error("Bu e-posta adresine zaten referans daveti gönderilmiş.");
    }

    // Aynı rolde başka biri var mı kontrolü
    const roleExisting = await db.query.references.findFirst({
        where: and(
            eq(references.applicationId, applicationId),
            eq(references.title, title)
        )
    });

    if (roleExisting) {
        throw new Error(`Zaten bir ${title === 'muhtar' ? 'Mahalle Muhtarı' : 'Üniversite Hocası'} referansı eklediniz. Lütfen önce eskisini silin.`);
    }

    await db.insert(references).values({
        applicationId,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        title,
        status: "pending"
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://burs.fbiadvakfi.org";
    const studentName = app?.user ? app.user.fullName : "Bir öğrenci";

    await sendEmail({
        code: EMAIL_CODES.DAVET,
        sentTo: email.trim().toLowerCase(),
        subject: "FBİAD Vakfı - Burs Başvurusu Referans Onayı",
        screen: "reference_request",
        body: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #1a365d; text-align: center;">FBİAD Vakfı Burs Platformu</h2>
                <p>Sayın <strong>${fullName.trim()}</strong>,</p>
                <p><strong>${studentName}</strong> isimli öğrencimiz, vakfımıza yaptığı burs başvurusunda sizi referans olarak göstermiştir.</p>
                <p>Öğrencimizin başvurusunu değerlendirmemize yardımcı olmak için sisteme giriş yaparak referans formunu doldurmanızı rica ederiz.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}" style="background-color: #1a365d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Sisteme Giriş Yap</a>
                </div>
                <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
                    Eğer bu e-postayı yanlışlıkla aldığınızı düşünüyorsanız, lütfen dikkate almayınız.
                </p>
            </div>
        `
    });

    revalidatePath(`/dashboard/applications/${applicationId}/references`);
    return { success: true };
}

export async function getReferenceRequests() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!currentUser || !currentUser.email) return [];

    const refs = await db.query.references.findMany({
        where: eq(references.email, currentUser.email),
        with: {
            application: {
                with: {
                    user: true,
                    fund: true
                }
            }
        },
        orderBy: (references, { desc }) => [desc(references.createdAt)]
    });

    return refs;
}

export async function deleteReference(referenceId: string, applicationId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        )
    });

    if (!app) throw new Error("Başvuru bulunamadı veya yetkiniz yok.");

    await db.delete(references).where(
        and(
            eq(references.id, referenceId),
            eq(references.applicationId, applicationId)
        )
    );

    revalidatePath(`/dashboard/applications/${applicationId}/references`);
    return { success: true };
}

export async function processReferenceApproval(referenceId: string, status: "approved" | "rejected", comment: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    // Güvenlik: Referans bu kişiye mi ait?
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!currentUser || !currentUser.email) {
        throw new Error("Hesabınızın geçerli bir e-posta adresi yok.");
    }

    const ref = await db.query.references.findFirst({
        where: and(
            eq(references.id, referenceId),
            eq(references.email, currentUser.email)
        )
    });

    if (!ref) throw new Error("Bu referans isteğine erişme yetkiniz yok veya kayıt silinmiş.");

    // Update the reference
    await db.update(references)
        .set({ status, comment, userId: currentUser.id })
        .where(eq(references.id, referenceId));

    if (status === "approved") {
        // Kontrol: başvuru artık 1 muhtar 1 hoca içeriyor mu?
        const allRefs = await db.query.references.findMany({
            where: and(
                eq(references.applicationId, ref.applicationId),
                eq(references.status, "approved")
            )
        });

        const hasMuhtar = allRefs.some((r: any) => r.title === 'muhtar');
        const hasTeacher = allRefs.some((r: any) => r.title === 'teacher');

        if (hasMuhtar && hasTeacher) {
            await db.update(applications)
                .set({ status: "in_pool" })
                .where(eq(applications.id, ref.applicationId));
        }

        const appObj = await db.query.applications.findFirst({
            where: eq(applications.id, ref.applicationId)
        });

        if (appObj) {
            await createNotification(
                tenantData.tenantId,
                [appObj.userId],
                'reference',
                'Referans Değerlendirmesi Tamamlandı',
                `${ref.fullName} referans onay formunu başarıyla doldurdu.`
            );
        }
    }

    revalidatePath("/dashboard/invitations");
    return { success: true };
}

export async function resendReferenceRequest(referenceId: string, applicationId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    // Öğrenci bu başvuruya sahip mi?
    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        ),
        with: { user: true }
    });

    if (!app) throw new Error("Yetkiniz yok.");

    const ref = await db.query.references.findFirst({
        where: eq(references.id, referenceId)
    });

    if (!ref) throw new Error("Referans bulunamadı.");

    // Statüyü pending'e çek ve yorumu temizle
    await db.update(references)
        .set({ status: "pending", comment: null })
        .where(eq(references.id, referenceId));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://burs.fbiadvakfi.org";
    const studentName = app?.user ? app.user.fullName : "Bir öğrenci";

    await sendEmail({
        code: EMAIL_CODES.DAVET,
        sentTo: ref.email,
        subject: "FBİAD Vakfı - Referans Hatırlatması",
        screen: "reference_request_resend",
        body: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #1a365d; text-align: center;">FBİAD Vakfı Burs Platformu</h2>
                <p>Sayın <strong>${ref.fullName}</strong>,</p>
                <p><strong>${studentName}</strong> isimli öğrencimiz için daha önceden gönderilmiş olan referans isteği için size bir hatırlatma gönderiyoruz.</p>
                <p>Lütfen vakit ayırıp sisteme giriş yaparak değerlendirmenizi tamamlayınız.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}" style="background-color: #1a365d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Sisteme Giriş Yap</a>
                </div>
            </div>
        `
    });

    revalidatePath(`/dashboard/applications/${applicationId}/references`);
    return { success: true };
}

export async function requestExemption(applicationId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        )
    });

    if (!app) throw new Error("Yetkiniz yok veya başvuru bulunamadı.");

    await db.update(applications)
        .set({ isExemptionRequested: true })
        .where(eq(applications.id, applicationId));

    revalidatePath(`/dashboard/applications`);
    revalidatePath(`/dashboard/applications/${applicationId}/references`);
    return { success: true };
}

export async function getExemptionRequests() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') throw new Error("Unauthorized");

    const requests = await db.query.applications.findMany({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            inArray(applications.status, ["submitted", "waiting_reference"]),
            eq(applications.isExemptionRequested, true)
        ),
        with: {
            user: true,
            form: true
        },
        orderBy: (applications, { desc }) => [desc(applications.updatedAt)]
    });

    return requests;
}

export async function processExemption(applicationId: string, action: "approve" | "reject", reason?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') throw new Error("Unauthorized");

    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.tenantId, tenantData.tenantId)
        ),
        with: { user: true }
    });

    if (!app) throw new Error("Başvuru bulunamadı.");

    if (action === "approve") {
        await db.update(applications)
            .set({ 
                status: "in_pool",
                isExemptionRequested: false // No longer pending
            })
            .where(eq(applications.id, applicationId));

        // Create notification
        await createNotification(
            tenantData.tenantId,
            [app.userId],
            'application',
            'Eski Bursiyer Statünüz Onaylandı',
            'Tebrikler! Eski bursiyer statünüz onaylandı ve başvurunuz referans aşamasını atlayarak başarılı bir şekilde Bursiyer Havuzuna alındı.',
            `/dashboard/applications`
        );

        // Send Email
        if (app.user?.email) {
            await sendEmail({
                code: EMAIL_CODES.GENEL,
                sentTo: app.user.email,
                subject: `${tenantData.tenantName || 'Vakıf'} - Muafiyet Talebi Onaylandı`,
                screen: "exemption_approved",
                body: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                        <h2 style="color: #1a365d; text-align: center;">${tenantData.tenantName || 'Vakıf'} Burs Platformu</h2>
                        <p>Sayın <strong>${app.user.fullName}</strong>,</p>
                        <p>Tebrikler! Vakfımıza yaptığınız "Eski Bursiyer" muafiyet talebi yöneticilerimiz tarafından onaylanmıştır.</p>
                        <p>Başvurunuz, Muhtar ve Akademisyen referans aşamalarını başarıyla atlayarak doğrudan Bursiyer Havuzu'na alınmıştır.</p>
                    </div>
                `
            });
        }

    } else if (action === "reject") {
        await db.update(applications)
            .set({ 
                isExemptionRequested: false 
                // status remains 'submitted'
            })
            .where(eq(applications.id, applicationId));

        const rejectionMessage = reason 
            ? `Eski bursiyerlik beyanınız doğrulanamadı veya reddedildi. Red Sebebi: "${reason}". Başvurunuza devam edebilmek için lütfen referanslarınızı giriniz.` 
            : 'Eski bursiyerlik beyanınız doğrulanamadı. Başvurunuza devam edebilmek için lütfen referanslarınızı giriniz.';

        // Create notification
        await createNotification(
            tenantData.tenantId,
            [app.userId],
            'application',
            'Muafiyet Talebiniz Onaylanmadı',
            rejectionMessage,
            `/dashboard/applications/${applicationId}/references`
        );

        // Send Email
        if (app.user?.email) {
            await sendEmail({
                code: EMAIL_CODES.GENEL,
                sentTo: app.user.email,
                subject: `${tenantData.tenantName || 'Vakıf'} - Muafiyet Talebi Reddedildi`,
                screen: "exemption_rejected",
                body: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                        <h2 style="color: #1a365d; text-align: center;">${tenantData.tenantName || 'Vakıf'} Burs Platformu</h2>
                        <p>Sayın <strong>${app.user.fullName}</strong>,</p>
                        <p>Bilgilendirme: Vakfımıza yaptığınız muafiyet talebi yöneticilerimiz tarafından onaylanmamıştır.</p>
                        ${reason ? `<p style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 10px; color: #c53030;"><strong>Red Sebebi:</strong> ${reason}</p>` : ''}
                        <p>Başvurunuza devam edebilmek ve havuza girebilmek için sisteme giriş yaparak Mahalle Muhtarı ve Akademisyen referans bilgilerinizi girmeniz gerekmektedir.</p>
                    </div>
                `
            });
        }
    }

    revalidatePath("/dashboard/admin/exemptions");
    revalidatePath("/dashboard/applications");
    return { success: true };
}
