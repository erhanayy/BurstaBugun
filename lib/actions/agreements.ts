"use server";

import { db } from "@/lib/db";
import { contracts, userContracts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMissingContracts(userId: string) {
    // Tüm aktif (güncel versiyon) sistem sözleşmeleri
    const activeContractsList = await db.query.contracts.findMany({
        where: eq(contracts.isActive, true)
    });

    if (activeContractsList.length === 0) return []; // Check if system has no contracts

    const signedList = await db.query.userContracts.findMany({
        where: eq(userContracts.userId, userId)
    });

    const signedContractIds = new Set(signedList.map(s => s.contractId));

    // Sign edilmemiş olanları döndür
    return activeContractsList.filter(c => !signedContractIds.has(c.id));
}

export async function signContract(userId: string, contractId: string) {
    if (!userId || !contractId) throw new Error("Eksik bilgi!");

    await db.insert(userContracts).values({
        userId,
        contractId,
        acceptedAt: new Date(),
    });

    revalidatePath("/dashboard");
    return true;
}

export async function getAdminContracts() {
    return await db.query.contracts.findMany({
        orderBy: (contracts, { desc }) => [desc(contracts.createdAt)]
    });
}

export async function createContractVersion(data: { title: string, type: any, version: string, content: string }) {
    // Aynı tipteki eski sözleşmeleri deaktif et
    await db.update(contracts)
        .set({ isActive: false })
        .where(eq(contracts.type, data.type));

    // Yenisini ekle
    await db.insert(contracts).values({
        type: data.type,
        title: data.title,
        version: data.version,
        content: data.content,
        isActive: true,
    });

    revalidatePath("/dashboard/admin/agreements");
    return true;
}

export async function getSignedContracts(userId: string) {
    const { desc } = await import("drizzle-orm");
    // Get all userContracts for this user, joined with contracts table
    const result = await db.select({
        id: contracts.id,
        type: contracts.type,
        version: contracts.version,
        title: contracts.title,
        content: contracts.content,
        acceptedAt: userContracts.acceptedAt
    }).from(userContracts)
        .innerJoin(contracts, eq(userContracts.contractId, contracts.id))
        .where(eq(userContracts.userId, userId))
        .orderBy(desc(userContracts.acceptedAt));

    return result;
}
