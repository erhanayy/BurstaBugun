"use server";

import { db } from "@/lib/db";
import { tenantBankAccounts } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface BankAccountInput {
    id?: string;
    bankName: string;
    accountName: string;
    iban?: string | null;
    accountNumber?: string | null;
    currency?: string;
    isActive?: boolean;
    displayOrder?: number;
}

export async function getTenantBankAccounts() {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz erişim", accounts: [] };
        }

        const accounts = await db.query.tenantBankAccounts.findMany({
            where: eq(tenantBankAccounts.tenantId, tenantData.tenantId),
            orderBy: [asc(tenantBankAccounts.displayOrder), desc(tenantBankAccounts.createdAt)]
        });

        return { success: true, accounts };
    } catch (error: any) {
        console.error("getTenantBankAccounts error:", error);
        return { success: false, error: error.message || "Banka hesapları yüklenemedi", accounts: [] };
    }
}

export async function saveTenantBankAccount(data: BankAccountInput) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        if (!data.bankName?.trim() || !data.accountName?.trim()) {
            return { success: false, error: "Banka adı ve hesap adı zorunludur." };
        }

        // Clean IBAN
        const cleanIban = data.iban ? data.iban.replace(/\s+/g, '').toUpperCase() : null;

        if (data.id) {
            // Update
            await db.update(tenantBankAccounts)
                .set({
                    bankName: data.bankName.trim(),
                    accountName: data.accountName.trim(),
                    iban: cleanIban,
                    accountNumber: data.accountNumber?.trim() || null,
                    currency: data.currency?.trim() || 'TRY',
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    displayOrder: data.displayOrder || 0,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(tenantBankAccounts.id, data.id),
                        eq(tenantBankAccounts.tenantId, tenantData.tenantId)
                    )
                );
        } else {
            // Insert
            await db.insert(tenantBankAccounts).values({
                tenantId: tenantData.tenantId,
                bankName: data.bankName.trim(),
                accountName: data.accountName.trim(),
                iban: cleanIban,
                accountNumber: data.accountNumber?.trim() || null,
                currency: data.currency?.trim() || 'TRY',
                isActive: data.isActive !== undefined ? data.isActive : true,
                displayOrder: data.displayOrder || 0
            });
        }

        revalidatePath("/dashboard/admin/bank-accounts");
        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("saveTenantBankAccount error:", error);
        return { success: false, error: error.message || "Banka hesabı kaydedilemedi." };
    }
}

export async function toggleBankAccountStatus(id: string, isActive: boolean) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        await db.update(tenantBankAccounts)
            .set({ isActive, updatedAt: new Date() })
            .where(
                and(
                    eq(tenantBankAccounts.id, id),
                    eq(tenantBankAccounts.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/bank-accounts");
        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("toggleBankAccountStatus error:", error);
        return { success: false, error: error.message || "Durum güncellenemedi." };
    }
}

export async function deleteTenantBankAccount(id: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        await db.delete(tenantBankAccounts)
            .where(
                and(
                    eq(tenantBankAccounts.id, id),
                    eq(tenantBankAccounts.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/bank-accounts");
        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("deleteTenantBankAccount error:", error);
        return { success: false, error: error.message || "Banka hesabı silinemedi." };
    }
}
