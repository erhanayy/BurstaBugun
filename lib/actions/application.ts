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

    const { fundId, ...answers } = data;

    // Check if already applied to this fund
    const existing = await db.query.applications.findFirst({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            eq(applications.userId, tenantData.userId),
            eq(applications.fundId, fundId)
        )
    });

    if (existing) {
        throw new Error("Bu fona zaten başvurunuz bulunmaktadır.");
    }

    await db.insert(applications).values({
        tenantId: tenantData.tenantId,
        userId: tenantData.userId,
        fundId: fundId,
        answersJson: JSON.stringify(answers),
        status: 'submitted',
    });

    revalidatePath("/dashboard/applications");
    redirect("/dashboard/applications");
}
