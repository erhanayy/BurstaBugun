"use server";

import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
            const inserted = await db.insert(applications).values({
                tenantId: data.tenantId,
                userId: data.userId,
                formId: data.formId,
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
            await db.insert(applications).values({
                tenantId: data.tenantId,
                userId: data.userId,
                formId: data.formId,
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
