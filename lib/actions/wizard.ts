"use server";

import { db } from "@/lib/db";
import { applications, funds, tenantUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function getPoolFund(tenantId: string) {
    let poolFund = await db.query.funds.findFirst({
        where: eq(funds.tenantId, tenantId)
    });

    if (!poolFund) {
        const adminTu = await db.query.tenantUsers.findFirst({
            where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.role, 'admin'))
        });
        
        if (!adminTu) return null;
        
        const inserted = await db.insert(funds).values({
            tenantId,
            ownerId: adminTu.userId,
            title: "Bursiyer Aday Havuzu",
            description: "Yeni başvuran ve inceleme aşamasında olan öğrencilerin toplandığı genel havuz.",
        }).returning();
        
        poolFund = inserted[0];
    }

    return poolFund;
}

export async function saveDraftApplication(data: {
    draftId?: string;
    tenantId: string;
    userId: string;
    formId: string;
    answersJson: string;
    period?: string;
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
                period: data.period,
                status: 'draft',
                answersJson: data.answersJson,
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
    period?: string;
}) {
    try {
        if (data.draftId) {
            await db.update(applications)
                .set({
                    answersJson: data.answersJson,
                    status: 'waiting_reference'
                })
                .where(eq(applications.id, data.draftId));
        } else {
            const poolFund = await getPoolFund(data.tenantId);
            if (!poolFund) return { success: false, error: "Referans fon havuzu bulunamadı." };

            await db.insert(applications).values({
                tenantId: data.tenantId,
                userId: data.userId,
                formId: data.formId,
                fundId: poolFund.id,
                period: data.period,
                status: 'waiting_reference',
                answersJson: data.answersJson,
            });
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
