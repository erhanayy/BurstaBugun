"use server";

import { db } from "@/lib/db";
import { applications, references, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

export async function addReference(applicationId: string, email: string, fullName: string, title: "muhtar" | "teacher" | "other") {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    // Mevcut öğrencinin başvurusunu kontrol et
    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        )
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

    // TODO: Gerçek e-posta servisi entegrasyonu (Resend, SendGrid vs. ile)
    console.log(`[EMAIL DISPATCH] To: ${email}, Subject: Referans İsteği (Mocked)`);

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
        )
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

    console.log(`[EMAIL DISPATCH] To: ${ref.email}, Subject: Referans Hatırlatması / Yeniden Değerlendirme İsteği`);

    revalidatePath(`/dashboard/applications/${applicationId}/references`);
    return { success: true };
}
