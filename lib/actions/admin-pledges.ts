"use server";

import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { pledges, pledgeTransactions, payments, parametersTenantSeasons, users } from "@/lib/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Taahhütleri Getir (Actual ve +35 Gün Vadesi Gelen Borç hesaplamasıyla birlikte)
export async function getPledges(periodId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    // Aktif dönem parametrelerini çek
    const periodParams = await db.select({
        period: parametersTenantSeasons.period,
        defaultFundAmount: parametersTenantSeasons.defaultFundAmount,
        defaultFundDuration: parametersTenantSeasons.defaultFundDuration,
        seasonStartDate: parametersTenantSeasons.seasonStartDate,
    }).from(parametersTenantSeasons).where(eq(parametersTenantSeasons.id, periodId)).limit(1);

    const defaultAmount = periodParams[0]?.defaultFundAmount || 5000;
    const defaultDuration = periodParams[0]?.defaultFundDuration || 10;
    const costPerStudent = defaultAmount * defaultDuration;

    // +35 Gün kuralına göre vadesi gelen ay hesabını yap
    const now = new Date();
    const targetDate = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000); // Bugün + 35 takvim günü
    
    // Sezon başlangıç tarihi (varsayılan Ağustos 1)
    let startYear = targetDate.getFullYear();
    let startMonth = 8; // Ağustos (8. ay)
    if (periodParams[0]?.seasonStartDate) {
        const sDate = new Date(periodParams[0].seasonStartDate);
        startYear = sDate.getFullYear();
        startMonth = sDate.getMonth() + 1;
    } else if (periodParams[0]?.period) {
        const m = periodParams[0].period.match(/(\d{4})/);
        if (m) startYear = parseInt(m[1]);
    }

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const elapsedMonths = (targetYear - startYear) * 12 + (targetMonth - startMonth) + 1;
    const dueMonths = Math.min(defaultDuration, Math.max(1, elapsedMonths));
    const dueMonthName = targetDate.toLocaleDateString('tr-TR', { month: 'long' });

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

    const pledgesList = rawPledgesList.map(p => {
        const targetAmount = p.targetStudentCount * costPerStudent;
        const dueTargetAmount = p.targetStudentCount * defaultAmount * dueMonths;
        const dueRemainingDebt = Math.max(0, dueTargetAmount - p.actualAmount);
        const isDueFulfilled = p.actualAmount >= dueTargetAmount;

        return {
            ...p,
            targetAmount,
            dueMonths,
            dueMonthName,
            dueTargetAmount,
            dueRemainingDebt,
            isDueFulfilled,
            monthlyPerStudent: defaultAmount,
            periodName: periodParams[0]?.period || '2026-2027',
        };
    });

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

// Taahhüt E-Posta Hatırlatması Gönder
export async function sendPledgeEmailReminder(pledgeId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    const pledge = await db.query.pledges.findFirst({
        where: eq(pledges.id, pledgeId)
    });

    if (!pledge) {
        return { success: false, error: "Taahhüt bulunamadı." };
    }

    if (!pledge.email) {
        return { success: false, error: "Bağışçıya ait e-posta adresi bulunmuyor." };
    }

    const periodParams = await db.query.parametersTenantSeasons.findFirst({
        where: eq(parametersTenantSeasons.id, pledge.periodId)
    });

    const defaultAmount = periodParams?.defaultFundAmount || 5000;
    const defaultDuration = periodParams?.defaultFundDuration || 10;

    const now = new Date();
    const targetDate = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
    let startYear = targetDate.getFullYear();
    let startMonth = 8;
    if (periodParams?.seasonStartDate) {
        const sDate = new Date(periodParams.seasonStartDate);
        startYear = sDate.getFullYear();
        startMonth = sDate.getMonth() + 1;
    } else if (periodParams?.period) {
        const m = periodParams.period.match(/(\d{4})/);
        if (m) startYear = parseInt(m[1]);
    }
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const elapsedMonths = (targetYear - startYear) * 12 + (targetMonth - startMonth) + 1;
    const dueMonths = Math.min(defaultDuration, Math.max(1, elapsedMonths));
    const dueMonthName = targetDate.toLocaleDateString('tr-TR', { month: 'long' });

    const rawActual = await db.select({
        actualAmount: sql<number>`COALESCE(SUM(${pledgeTransactions.allocatedAmount}), 0)::int`,
    })
    .from(pledgeTransactions)
    .where(eq(pledgeTransactions.pledgeId, pledgeId));

    const actualAmount = rawActual[0]?.actualAmount || 0;
    const dueTargetAmount = pledge.targetStudentCount * defaultAmount * dueMonths;
    const dueRemainingDebt = Math.max(0, dueTargetAmount - actualAmount);

    const formatTL = (val: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val) + " ₺";

    const { sendEmail, EMAIL_CODES } = await import("@/lib/email");
    const subject = `FBİAD Vakfı - ${periodParams?.period || ''} Burs Taahhüdü Bilgilendirmesi`;

    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1E3A8A; margin: 0;">FBİAD VAKFI</h2>
                <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">Burs Taahhüdü Bilgilendirme ve Hatırlatması</p>
            </div>
            
            <p style="color: #374151; font-size: 15px;">Sayın <strong>${pledge.fullName}</strong>,</p>
            
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                FBİAD Vakfı <strong>${periodParams?.period || '2026-2027'}</strong> burs dönemi kapsamında 
                <strong>${pledge.targetStudentCount}</strong> öğrenci için vermiş olduğunuz değerli burs taahhüdünüz için teşekkür ederiz.
            </p>
            
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                    <tr>
                        <td style="padding: 6px 0;">Taahhüt Edilen Bursiyer:</td>
                        <td style="text-align: right; font-weight: bold;">${pledge.targetStudentCount} Öğrenci</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;">Vadesi Gelen Süre (${dueMonthName} Sonu Dahil):</td>
                        <td style="text-align: right; font-weight: bold;">${dueMonths} Ay</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;">Vadesi Gelen Katkı Payı Tutarı:</td>
                        <td style="text-align: right; font-weight: bold;">${formatTL(dueTargetAmount)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;">Sistemimize Yansıyan Ödemeniz:</td>
                        <td style="text-align: right; font-weight: bold; color: #059669;">${formatTL(actualAmount)}</td>
                    </tr>
                    <tr style="border-top: 1px solid #D1D5DB;">
                        <td style="padding: 8px 0; font-weight: bold; color: #DC2626;">Güncel Vadesi Gelen Bakiye:</td>
                        <td style="text-align: right; font-weight: bold; color: #DC2626; font-size: 16px;">${formatTL(dueRemainingDebt)}</td>
                    </tr>
                </table>
            </div>

            <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; border-radius: 6px; margin: 18px 0;">
                <p style="margin: 0 0 6px 0; font-weight: bold; color: #1E40AF; font-size: 13px;">
                    ℹ️ Neden Bir Sonraki Ayı (${dueMonthName}) Baz Alıyoruz?
                </p>
                <p style="margin: 0; color: #1E3A8A; font-size: 12.5px; line-height: 1.5;">
                    Öğrencilerimize ulaştırılan burs tutarlarından herhangi bir komisyon veya banka kesintisi yapılmaması adına, kredi kartı tahsilatları aracı ödeme kuruluşunda 33 gün yasal blokede bekledikten sonra vakfımıza aktarılmaktadır. Burs ödemelerinin takviminde aksama yaşanmaması için planlamamız bu vadeye göre yürütülmektedir.
                </p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: #FAFAFA;">
                <p style="margin: 0 0 12px 0; font-size: 13.5px; color: #374151; line-height: 1.5;">
                    💳 <strong>Kredi Kartı ile Ödeme İçin:</strong><br>
                    Mobil uygulamamıza giriş yapabilir veya doğrudan burs portalımız üzerinden ödemenizi tamamlayabilirsiniz:<br>
                    <a href="https://burs.fbiadvakfi.org/" style="color: #2563EB; font-weight: bold; text-decoration: underline;">https://burs.fbiadvakfi.org/</a>
                </p>
                <p style="margin: 0; font-size: 13.5px; color: #374151; line-height: 1.5;">
                    🏦 <strong>Havale / EFT ile Ödeme İçin:</strong><br>
                    Vakfımızın resmi banka hesap bilgilerine aşağıdaki sayfadan ulaşabilirsiniz:<br>
                    <a href="https://fbiadvakfi.org/bagis/havale" style="color: #2563EB; font-weight: bold; text-decoration: underline;">https://fbiadvakfi.org/bagis/havale</a>
                </p>
            </div>
            
            <p style="color: #374151; font-size: 13px; background-color: #FEF3C7; padding: 10px; border-radius: 6px; border-left: 4px solid #F59E0B; margin: 15px 0;">
                <strong>Not:</strong> Havale / EFT ile yapılan ödemelerde açıklama kısmına adınızı-soyadınızı yazmayı ve dekontu 
                <strong>FBİAD Burs Komitesi</strong> ile paylaşmayı lütfen unutmayınız.
            </p>
            
            <p style="color: #374151; font-size: 14px; margin-top: 25px;">
                Geleceğimiz olan öğrencilerimiz adına kıymetli destekleriniz için sonsuz teşekkür ederiz.
                <br><br>
                <strong>FBİAD Vakfı Yönetimi</strong>
            </p>
        </div>
    `;

    const sendRes = await sendEmail({
        code: EMAIL_CODES.BILDIRIM,
        sentTo: pledge.email,
        subject,
        body,
        screen: 'admin/pledges'
    });

    if (!sendRes.success) {
        return { success: false, error: sendRes.error || "E-posta gönderilemedi." };
    }

    return { success: true };
}

// Eşleşmemiş (Taahhütsüz) Tahsilatları Getir (Sekme 2)
export async function getUnmatchedPayments(periodId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    const { gte, lte } = await import("drizzle-orm");

    const activePeriod = await db.query.parametersTenantSeasons.findFirst({
        where: eq(parametersTenantSeasons.id, periodId)
    });

    const conditions: any[] = [
        eq(payments.tenantId, tenantData.tenantId),
        eq(payments.status, 'completed'),
        isNull(pledgeTransactions.id) // Sadece eşleşmemiş olanlar
    ];

    // Dönemin bağış/tahsilat tarihlerine göre filtrele
    if (activePeriod?.sponsorPaymentStartDate) {
        conditions.push(gte(payments.paymentDate, activePeriod.sponsorPaymentStartDate));
    }
    if (activePeriod?.sponsorPaymentEndDate) {
        conditions.push(lte(payments.paymentDate, activePeriod.sponsorPaymentEndDate));
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
    .where(and(...conditions))
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

// Taahhüt Ödemelerini Getir
export async function getPledgePayments(pledgeId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    const transactions = await db.select({
        id: pledgeTransactions.id,
        allocatedAmount: pledgeTransactions.allocatedAmount,
        createdAt: pledgeTransactions.createdAt,
        payment: {
            id: payments.id,
            paymentDate: payments.paymentDate,
            amount: payments.amount,
            notes: payments.notes
        }
    })
    .from(pledgeTransactions)
    .leftJoin(payments, eq(payments.id, pledgeTransactions.paymentId))
    .where(eq(pledgeTransactions.pledgeId, pledgeId))
    .orderBy(desc(pledgeTransactions.createdAt));

    return transactions;
}

// Taahhüt Ödemesi Sil (Geri al)
export async function deletePledgePayment(transactionId: string) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        throw new Error("Yetkisiz erişim");
    }

    // Sadece transaction'ı sil, asıl payment'ı silme (belki yanlışlıkla eşleştirildi, boşa çıksın)
    // Yoksa payment'i komple mi silelim? Kullanıcı "hatalı girişe karşı silme butonu" diyor.
    // Eğer Tahsilat Gir üzerinden girildiyse hem payment hem transaction silinmeli.
    // Şimdilik işlemi geri almak için transaction'ı bulalım, ve payment'i de bulalım.
    const tx = await db.select().from(pledgeTransactions).where(eq(pledgeTransactions.id, transactionId)).limit(1);
    
    if (tx.length > 0) {
        await db.delete(pledgeTransactions).where(eq(pledgeTransactions.id, transactionId));
        if (tx[0].paymentId) {
             // Opsiyonel olarak, eşleşme kalktı, payment boşa çıkar.
             // Ama kullanıcı "Tahsilat Gir ekranından" hatalı giriş silecekse payment'i de silebiliriz.
             // Biz şimdilik hem pledgeTransaction'ı hem payment'ı silelim çünkü mükerrer girdiğini varsayıyor.
             await db.delete(payments).where(eq(payments.id, tx[0].paymentId));
        }
    }

    revalidatePath("/dashboard/admin/pledges");
    return { success: true };
}
