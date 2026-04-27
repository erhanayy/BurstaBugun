"use server";

import { db } from "@/lib/db";
import { systemParameters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTenant } from "@/lib/data/tenant";

export async function getSystemParameter(key: string, defaultValue: string = "") {
    const res = await db.query.systemParameters.findFirst({
        where: eq(systemParameters.key, key)
    });
    return res ? res.value : defaultValue;
}

export async function setSystemParameter(key: string, value: string, description?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') {
        throw new Error("Yetkisiz işlem.");
    }

    const existing = await db.query.systemParameters.findFirst({
        where: eq(systemParameters.key, key)
    });

    if (existing) {
        await db.update(systemParameters)
            .set({ value, description: description || existing.description, updatedAt: new Date() })
            .where(eq(systemParameters.id, existing.id));
    } else {
        await db.insert(systemParameters).values({
            key,
            value,
            description: description || ""
        });
    }

    revalidatePath("/", "layout");
    return true;
}

export async function getAllSystemParameters() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.userRole !== 'admin') {
        return [];
    }

    return await db.query.systemParameters.findMany({
        orderBy: (p, { asc }) => [asc(p.key)]
    });
}
