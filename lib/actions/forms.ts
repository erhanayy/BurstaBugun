"use server";

import { db } from "@/lib/db";
import { applicationForms } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getForms(tenantId: string) {
    try {
        const forms = await db.query.applicationForms.findMany({
            where: eq(applicationForms.tenantId, tenantId),
            orderBy: [desc(applicationForms.createdAt)],
        });
        return { success: true, data: forms };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createForm(data: {
    tenantId: string;
    title: string;
    description?: string;
    steps: any;
}) {
    try {
        await db.insert(applicationForms).values({
            tenantId: data.tenantId,
            title: data.title,
            description: data.description,
            steps: data.steps,
        });
        revalidatePath("/dashboard/admin/forms");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateForm(data: {
    id: string;
    tenantId: string;
    title: string;
    description?: string;
    steps: any;
}) {
    try {
        await db.update(applicationForms)
            .set({
                title: data.title,
                description: data.description,
                steps: data.steps,
            })
            .where(eq(applicationForms.id, data.id));
        revalidatePath("/dashboard/admin/forms");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteForm(id: string) {
    try {
        await db.delete(applicationForms).where(eq(applicationForms.id, id));
        revalidatePath("/dashboard/admin/forms");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
