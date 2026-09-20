"use server";

import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { pledges, pledgeTransactions, payments, parametersTenantSeasons, users } from "@/lib/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Taahhütleri Getir (Actual hesaplamasıyla birlikte)
export async function getPledges(periodId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    // Aktif dönem parametrelerini çek
    const periodParams = await db.select({
        defaultFundAmount: parametersTenantSeasons.defaultFundAmount,
        defaultFundDuration: parametersTenantSeasons.defaultFundDuration,
    }).from(parametersTenantSeasons).where(eq(parametersTenantSeasons.id, periodId)).limit(1);

    const defaultAmount = periodParams[0]?.defaultFundAmount || 5000;
    const defaultDuration = periodParams[0]?.defaultFundDuration || 10;
    const costPerStudent = defaultAmount * defaultDuration;

    // Sol taraftaki taahhütler ve onlara bağlı işlemlerden actualAmount'u hesapla
    const rawPledgesList = await db.select({
        id: pledges.id,
        fullName: pledges.fullName,
        email: pledges.email,
        phone: pledges.phone,
        targetStudentCount: pledges.targetStudentCount,
        status: pledges.status,
        createdAt: pledges.createdAt,
        actualAmount: sql<number>`COALESCE(SUM(${pledgeTransactions.allocatedAmount}), 0)::int`,
    })
    .from(pledges)
    .leftJoin(pledgeTransactions, eq(pledgeTransactions.pledgeId, pledges.id))
    .where(
        and(
            eq(pledges.tenantId, tenantData.tenantId),
            eq(pledges.periodId, periodId)
        )
    )
    .groupBy(pledges.id)
    .orderBy(pledges.fullName);

    const pledgesList = rawPledgesList.map(p => ({
        ...p,
        targetAmount: p.targetStudentCount * costPerStudent
    }));

    // Yeşile (fulfilled) dönenleri otomatik güncelle (Dinamik Status Check)
    for (const pledge of pledgesList) {
        if (pledge.actualAmount >= pledge.targetAmount && pledge.status !== 'fulfilled') {
            await db.update(pledges).set({ status: 'fulfilled' }).where(eq(pledges.id, pledge.id));
            pledge.status = 'fulfilled';
        } else if (pledge.actualAmount < pledge.targetAmount && pledge.status === 'fulfilled') {
            await db.update(pledges).set({ status: 'pending' }).where(eq(pledges.id, pledge.id));
            pledge.status = 'pending';
        }
    }

    return pledgesList;
}

// Eşleşmemiş (Taahhütsüz) Tahsilatları Getir (Sekme 2)
export async function getUnmatchedPayments() {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    const unmatched = await db.select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        notes: payments.notes,
        status: payments.status,
        createdAt: payments.createdAt,
        user: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
        }
    })
    .from(payments)
    .leftJoin(pledgeTransactions, eq(pledgeTransactions.paymentId, payments.id))
    .leftJoin(users, eq(users.id, payments.userId))
    .where(
        and(
            eq(payments.tenantId, tenantData.tenantId),
            eq(payments.status, 'completed'),
            isNull(pledgeTransactions.id) // Sadece eşleşmemiş olanlar
        )
    )
    .orderBy(desc(payments.createdAt));

    return unmatched;
}


// Tekil Taahhüt Ekle
export async function createPledge(data: { fullName: string; email?: string; phone?: string; targetStudentCount: number; periodId: string }) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    await db.insert(pledges).values({
        tenantId: tenantData.tenantId,
        periodId: data.periodId,
        fullName: data.fullName.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        targetStudentCount: data.targetStudentCount,
        status: 'pending',
    });

    revalidatePath("/dashboard/admin/pledges");
    return { success: true };
}

// Manuel Eşleştirme (Payment -> Pledge)
export async function matchPaymentToPledge(paymentId: string, pledgeId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    const paymentResult = await db.select({ amount: payments.amount }).from(payments).where(eq(payments.id, paymentId)).limit(1);
    if (paymentResult.length === 0) {
        throw new Error("Ödeme bulunamadı");
    }

    await db.insert(pledgeTransactions).values({
        pledgeId,
        paymentId,
        allocatedAmount: paymentResult[0].amount,
    });

    // Durum güncellemesi getPledges çağrıldığında otomatik yapılır
    revalidatePath("/dashboard/admin/pledges");
    return { success: true };
}

// Excel'den Toplu İçe Aktar
export async function importPledgesFromExcel(periodId: string, rows: any[]) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    // Mevcut taahhütleri al (Kopya kontrolü için)
    const existing = await db.select({ fullName: pledges.fullName, phone: pledges.phone, email: pledges.email })
        .from(pledges)
        .where(
            and(
                eq(pledges.tenantId, tenantData.tenantId),
                eq(pledges.periodId, periodId)
            )
        );

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
        const name = row['Ad Soyad']?.toString().trim();
        const phone = row['Telefon']?.toString().trim() || null;
        const email = row['Email']?.toString().trim() || null;
        const count = parseInt(row['Bursiyer Adedi']) || parseInt(row['Bursiyer Sayısı']) || 1;

        if (!name) continue;

        // Kopya Kontrolü
        const isDuplicate = existing.some(e => 
            (e.fullName.toLowerCase() === name.toLowerCase()) || 
            (phone && e.phone === phone) || 
            (email && e.email === email)
        );

        if (isDuplicate) {
            skippedCount++;
            continue;
        }

        await db.insert(pledges).values({
            tenantId: tenantData.tenantId,
            periodId: periodId,
            fullName: name,
            email: email,
            phone: phone,
            targetStudentCount: count,
            status: 'pending'
        });
        
        // Eklediğimizi local listeye de ekleyelim ki sonraki döngülerde aynı excel dosyasında mükerrer varsa atlasın
        existing.push({ fullName: name, phone: phone, email: email });
        importedCount++;
    }

    revalidatePath("/dashboard/admin/pledges");
    return { success: true, importedCount, skippedCount };
}

// Taahhüt Sil
export async function deletePledge(pledgeId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    // İlgili transactions'ları da silelim (cascade yoksa)
    await db.delete(pledgeTransactions).where(eq(pledgeTransactions.pledgeId, pledgeId));
    await db.delete(pledges).where(eq(pledges.id, pledgeId));

    revalidatePath("/dashboard/admin/pledges");
    return { success: true };
}

// Taahhüt Hedefini Güncelle
export async function updatePledgeTarget(pledgeId: string, targetStudentCount: number) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    await db.update(pledges).set({ targetStudentCount }).where(eq(pledges.id, pledgeId));

    revalidatePath("/dashboard/admin/pledges");
    return { success: true };
}

