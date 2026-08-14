"use server";

import { db } from "@/lib/db";
import { applications, funds, fundContributors } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAvailableFunds() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    return await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantData.tenantId),
        orderBy: (funds, { desc }) => [desc(funds.createdAt)],
    });
}

export async function getMyApplications() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const apps = await db.query.applications.findMany({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            eq(applications.userId, tenantData.userId)
        ),
        with: {
            fund: true,
            form: true,
            references: true,
            selections: true,
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)],
    });

    for (const app of apps) {
        if (app.fundId) {
            const contributors = await db.query.fundContributors.findMany({
                where: eq(fundContributors.fundId, app.fundId)
            });
            let isFundConfirmed = true;
            if (contributors.length > 0) {
                isFundConfirmed = contributors.every(c => c.isPaid);
            } else {
                isFundConfirmed = false;
            }

            if ((app.status === 'selected' || app.status === 'active') && !isFundConfirmed) {
                app.status = 'in_pool';
                (app as any).fund = null; // Hide fund info from student
            }
        }
    }

    return apps;
}

export async function submitApplication(data: any) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const answers = data;

    // Check if already has an application in this tenant
    const existing = await db.query.applications.findFirst({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            eq(applications.userId, tenantData.userId)
        )
    });

    if (existing) {
        throw new Error("Sistemde zaten aktif bir başvurunuz bulunmaktadır.");
    }

    await db.insert(applications).values({
        tenantId: tenantData.tenantId,
        userId: tenantData.userId,
        answersJson: JSON.stringify(answers),
        status: 'submitted',
    });

    revalidatePath("/dashboard/applications");
    redirect("/dashboard/applications");
}

export async function recoverApplicationDocuments(applicationId: string, docs: { ogrenciBelgesi?: string, transkript?: string, sabikaKaydi?: string }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const application = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, applicationId),
            eq(applications.userId, tenantData.userId)
        )
    });

    if (!application) throw new Error("Başvuru bulunamadı veya yetkiniz yok.");

    let answers: Record<string, any> = {};
    if (application.answersJson) {
        try {
            answers = JSON.parse(application.answersJson);
        } catch (e) {
            console.error("JSON parse error on recovery:", e);
        }
    }

    if (docs.ogrenciBelgesi) answers["Okul Öğrenci Belgesi"] = docs.ogrenciBelgesi;
    if (docs.transkript) answers["Okul Transkrip"] = docs.transkript; // Note: 'Transkrip' matches the DB schema field name exactly
    if (docs.sabikaKaydi) answers["Sabıka Kaydı Çıktısı"] = docs.sabikaKaydi;

    await db.update(applications)
        .set({ answersJson: JSON.stringify(answers) })
        .where(eq(applications.id, applicationId));

    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${applicationId}`);
    
    return { success: true };
}
