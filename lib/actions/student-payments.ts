"use server";

import { db } from "@/lib/db";
import { studentPaymentLogs, applications, funds } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

export async function addStudentPaymentLog(applicationId: string, fundId: string, amount: number, paymentDateStr?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole)) {
        throw new Error("Yetkiniz yok.");
    }

    const dateToUse = paymentDateStr ? new Date(paymentDateStr) : new Date();

    // Check if there is already a log for this month/year for this student
    const existingLog = await db.query.studentPaymentLogs.findFirst({
        where: sql`EXTRACT(MONTH FROM ${studentPaymentLogs.paymentDate}) = ${dateToUse.getMonth() + 1} 
                   AND EXTRACT(YEAR FROM ${studentPaymentLogs.paymentDate}) = ${dateToUse.getFullYear()}
                   AND ${studentPaymentLogs.applicationId} = ${applicationId}
                   AND ${studentPaymentLogs.tenantId} = ${tenantData.tenantId}`
    });

    if (existingLog) {
        throw new Error("Bu öğrenci için bu ayda zaten bir ödeme kaydı mevcut.");
    }

    await db.insert(studentPaymentLogs).values({
        tenantId: tenantData.tenantId,
        applicationId,
        fundId,
        amount,
        paymentDate: dateToUse,
        notes: "Manuel olarak ödendi (Vakıf Merkezi)"
    });

    // TODO: Send notification to student "Bursunuz yatmıştır"
    
    // Update distributed amount in the fund
    await db.execute(sql`
        UPDATE ${funds} 
        SET distributed_amount = COALESCE(distributed_amount, 0) + ${amount}
        WHERE id = ${fundId}
    `);

    revalidatePath("/dashboard/payments/upcoming");
    revalidatePath("/dashboard/payments/history");
    return { success: true };
}

export async function addMultipleStudentPaymentLogs(payments: { applicationId: string, fundId: string, amount: number, paymentDateStr?: string }[]) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole)) {
        throw new Error("Yetkiniz yok.");
    }

    let successCount = 0;
    let failCount = 0;

    for (const p of payments) {
        try {
            await addStudentPaymentLog(p.applicationId, p.fundId, p.amount, p.paymentDateStr);
            successCount++;
        } catch (e) {
            failCount++;
        }
    }

    return { success: successCount > 0, successCount, failCount };
}

export async function cancelStudentPaymentLog(logId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole)) {
        throw new Error("Yetkiniz yok.");
    }

    const log = await db.query.studentPaymentLogs.findFirst({
        where: and(
            eq(studentPaymentLogs.id, logId),
            eq(studentPaymentLogs.tenantId, tenantData.tenantId)
        )
    });

    if (!log) {
        throw new Error("Kayıt bulunamadı.");
    }

    await db.delete(studentPaymentLogs).where(eq(studentPaymentLogs.id, logId));

    // Revert distributed amount in the fund
    await db.execute(sql`
        UPDATE ${funds} 
        SET distributed_amount = COALESCE(distributed_amount, 0) - ${log.amount}
        WHERE id = ${log.fundId}
    `);

    revalidatePath("/dashboard/payments/upcoming");
    revalidatePath("/dashboard/payments/history");
    return { success: true };
}

export async function cancelMultipleStudentPaymentLogs(logIds: string[]) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole)) {
        throw new Error("Yetkiniz yok.");
    }

    let successCount = 0;
    let failCount = 0;

    for (const id of logIds) {
        try {
            await cancelStudentPaymentLog(id);
            successCount++;
        } catch (e) {
            failCount++;
        }
    }

    return { success: successCount > 0, successCount, failCount };
}
