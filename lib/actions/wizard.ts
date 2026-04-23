"use server";

import { db } from "@/lib/db";
import { applications, funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getPoolFund(tenantId: string) {
    let poolFund = await db.query.funds.findFirst({
        where: eq(funds.tenantId, tenantId)
    });
    return poolFund;
}

export async function saveDraftApplication(data: {
    draftId?: string;
    tenantId: string;
    userId: string;
    formId: string;
    answersJson: string;
}) {
    try {
        if (data.draftId) {
            await db.update(applications)
                .set({ answersJson: data.answersJson })
                .where(eq(applications.id, data.draftId));
            return { success: true, draftId: data.draftId };
        } else {
            const poolFund = await getPoolFund(data.tenantId);
            if (!poolFund) return { success: false, error: "Referans fon havuzu bulunamadı." };

            const inserted = await db.insert(applications).values({
                tenantId: data.tenantId,
                userId: data.userId,
                formId: data.formId,
                fundId: poolFund.id,
                answersJson: data.answersJson,
                status: "draft"
            }).returning({ id: applications.id });
            return { success: true, draftId: inserted[0].id };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function submitWizardApplication(data: {
    draftId?: string;
    tenantId: string;
    userId: string;
    formId: string;
    answersJson: string;
}) {
    try {
        if (data.draftId) {
            await db.update(applications)
                .set({ answersJson: data.answersJson, status: "waiting_reference" })
                .where(eq(applications.id, data.draftId));
        } else {
            const poolFund = await getPoolFund(data.tenantId);
            if (!poolFund) return { success: false, error: "Referans fon havuzu bulunamadı." };

            await db.insert(applications).values({
                tenantId: data.tenantId,
                userId: data.userId,
                formId: data.formId,
                fundId: poolFund.id,
                answersJson: data.answersJson,
                status: "waiting_reference"
            });
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
