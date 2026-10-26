"use server";

import { db } from "@/lib/db";
import { 
    signedDocumentDefinitions, 
    signedDocumentSubmissions, 
    applications, 
    users, 
    funds, 
    fundSelections, 
    parametersTenantSeasons 
} from "@/lib/db/schema";
import { eq, and, or, inArray, sql, desc, isNull } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. DOKÜMAN TANIMLARI (DOCUMENT DEFINITIONS)
// ==========================================

export async function getSignedDocumentDefinitions() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) {
        throw new Error("Oturum bulunamadı veya yetkisiz erişim.");
    }

    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işlemi yapmaya yetkiniz bulunmuyor.");
    }

    const defs = await db.select()
        .from(signedDocumentDefinitions)
        .where(eq(signedDocumentDefinitions.tenantId, tenantData.tenantId))
        .orderBy(desc(signedDocumentDefinitions.createdAt));

    return defs;
}

export async function saveSignedDocumentDefinition(data: {
    id?: string;
    name: string;
    targetRole?: 'all' | 'applicant' | 'sponsor_reference';
    isPeriodic: boolean;
    isActive?: boolean;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) {
        throw new Error("Oturum bulunamadı veya yetkisiz erişim.");
    }

    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işlemi yapmaya yetkiniz bulunmuyor.");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
        throw new Error("Doküman adı boş bırakılamaz.");
    }

    if (data.id) {
        // Güncelleme
        await db.update(signedDocumentDefinitions)
            .set({
                name: trimmedName,
                targetRole: data.targetRole || 'applicant',
                isPeriodic: data.isPeriodic,
                isActive: data.isActive !== undefined ? data.isActive : true,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(signedDocumentDefinitions.id, data.id),
                    eq(signedDocumentDefinitions.tenantId, tenantData.tenantId)
                )
            );
    } else {
        // Yeni Kayıt
        await db.insert(signedDocumentDefinitions).values({
            tenantId: tenantData.tenantId,
            name: trimmedName,
            targetRole: data.targetRole || 'applicant',
            isPeriodic: data.isPeriodic,
            isActive: data.isActive !== undefined ? data.isActive : true,
        });
    }

    revalidatePath('/dashboard/admin/required-documents');
    revalidatePath('/dashboard/admin/document-tracking');
    return { success: true };
}

export async function deleteSignedDocumentDefinition(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) {
        throw new Error("Oturum bulunamadı veya yetkisiz erişim.");
    }

    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işlemi yapmaya yetkiniz bulunmuyor.");
    }

    // İlişkili teslim kayıtlarıyla birlikte siler (onDelete: cascade tanımlı)
    await db.delete(signedDocumentDefinitions)
        .where(
            and(
                eq(signedDocumentDefinitions.id, id),
                eq(signedDocumentDefinitions.tenantId, tenantData.tenantId)
            )
        );

    revalidatePath('/dashboard/admin/required-documents');
    revalidatePath('/dashboard/admin/document-tracking');
    return { success: true };
}

// ==========================================
// 2. DOKÜMAN TAKİP (DOCUMENT TRACKING)
// ==========================================

export interface TrackingItem {
    id: string; // Composite row id: `${userId}_${definitionId}_${period || 'global'}`
    submissionId: string | null;
    userId: string;
    studentName: string;
    studentEmail: string | null;
    studentPhone: string;
    applicationId: string;
    fundName: string;
    period: string | null;
    periodName: string;
    definitionId: string;
    documentName: string;
    isPeriodic: boolean;
    isReceived: boolean;
    receivedAt: Date | null;
    receivedByAdminName: string | null;
}

export async function getSignedDocumentTrackingData(params: {
    periodFilter?: string;
    documentIdFilter?: string;
    searchQuery?: string;
    receivedFilter?: 'all' | 'received' | 'pending';
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) {
        throw new Error("Oturum bulunamadı.");
    }

    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işlemi yapmaya yetkiniz bulunmuyor.");
    }

    // 1. İlgili tenant için tanımlı aktif dokümanları çek
    const definitionsQuery = db.select()
        .from(signedDocumentDefinitions)
        .where(
            and(
                eq(signedDocumentDefinitions.tenantId, tenantData.tenantId),
                eq(signedDocumentDefinitions.isActive, true)
            )
        );

    const definitions = await definitionsQuery;

    // Eğer hiç doküman tanımlı değilse doğrudan boş dön
    if (definitions.length === 0) {
        return {
            definitions: [],
            items: [],
            seasons: [],
            stats: { total: 0, received: 0, pending: 0 }
        };
    }

    // 2. Tenant Sezonlarını Çek
    const seasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (s, { desc }) => [desc(s.isDefault), desc(s.period)]
    });

    const activeSeason = seasons.find(s => s.isDefault) || seasons.find(s => s.isActive) || seasons[0];
    const targetPeriod = params.periodFilter || activeSeason?.id || '';

    // Hedef dönemin metin karşılığını bul (örn: UUID ise dönemin adı '2026-2027')
    const seasonObj = seasons.find(s => s.id === targetPeriod || s.period === targetPeriod);
    const periodText = seasonObj?.period || targetPeriod;

    // 3. SADECE FONA SEÇİLMİŞ BURSİYERLERİ ÇEK (Kullanıcı Kuralı 1: "Öğrenci kapsamı sadece fona seçilmiş olanlar gelecek")
    const appConditions = [
        eq(applications.tenantId, tenantData.tenantId),
        eq(applications.isActive, true),
        inArray(applications.status, ['selected', 'active'])
    ];

    if (targetPeriod) {
        appConditions.push(
            or(
                eq(applications.period, targetPeriod),
                eq(applications.period, periodText)
            )!
        );
    }

    const selectedApplicants = await db.query.applications.findMany({
        where: and(...appConditions),
        with: {
            user: true,
            fund: true,
            selections: {
                where: eq(fundSelections.isActive, true),
                with: {
                    fund: true
                }
            }
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)]
    });

    // 4. Bu tenant ve kullanıcılar için mevcut teslim kayıtlarını çek
    const userIds = selectedApplicants.map(a => a.userId).filter(Boolean);
    let existingSubmissions: any[] = [];
    if (userIds.length > 0) {
        existingSubmissions = await db.select({
            id: signedDocumentSubmissions.id,
            documentDefinitionId: signedDocumentSubmissions.documentDefinitionId,
            userId: signedDocumentSubmissions.userId,
            period: signedDocumentSubmissions.period,
            isReceived: signedDocumentSubmissions.isReceived,
            receivedAt: signedDocumentSubmissions.receivedAt,
            receivedBy: signedDocumentSubmissions.receivedBy,
            notes: signedDocumentSubmissions.notes,
            receiverName: users.fullName,
        })
        .from(signedDocumentSubmissions)
        .leftJoin(users, eq(signedDocumentSubmissions.receivedBy, users.id))
        .where(
            and(
                eq(signedDocumentSubmissions.tenantId, tenantData.tenantId),
                inArray(signedDocumentSubmissions.userId, userIds)
            )
        );
    }

    // Submissions index: key = `${userId}_${docDefId}_${period || 'global'}`
    const submissionMap = new Map<string, any>();
    for (const sub of existingSubmissions) {
        // Dönem bazlı ise period, değilse 'global'
        const keyWithPeriod = `${sub.userId}_${sub.documentDefinitionId}_${sub.period || 'global'}`;
        submissionMap.set(keyWithPeriod, sub);
        // Dönem bağımsız kayıtlar için fallback
        const keyGlobal = `${sub.userId}_${sub.documentDefinitionId}_global`;
        if (!submissionMap.has(keyGlobal)) {
            submissionMap.set(keyGlobal, sub);
        }
    }

    // Filtre için seçilen doküman
    const filteredDefs = params.documentIdFilter
        ? definitions.filter(d => d.id === params.documentIdFilter)
        : definitions;

    // 5. Seçenek B (Dikey Liste) formatında kayıtları birleştir
    const items: TrackingItem[] = [];

    for (const app of selectedApplicants) {
        const student = app.user;
        if (!student) continue;

        // Öğrencinin fon adı (Direkt fund veya selections üzerinden)
        const fundName = app.fund?.title || app.selections?.[0]?.fund?.title || "Burs Fonu";
        const studentPeriod = periodText || app.period || "Genel";

        for (const def of filteredDefs) {
            // Eğer doküman dönem bazlı ise anahtar dönemi içerir, değilse 'global'
            const periodKey = def.isPeriodic ? (targetPeriod || periodText || 'global') : 'global';
            const lookupKey = `${student.id}_${def.id}_${periodKey}`;
            const sub = submissionMap.get(lookupKey) || (def.isPeriodic ? submissionMap.get(`${student.id}_${def.id}_${periodText}`) : null);

            const isReceived = sub ? !!sub.isReceived : false;

            // Teslim durumu filtresi
            if (params.receivedFilter === 'received' && !isReceived) continue;
            if (params.receivedFilter === 'pending' && isReceived) continue;

            // Arama filtresi (Ad Soyad, Telefon, E-posta)
            if (params.searchQuery) {
                const q = params.searchQuery.toLocaleLowerCase('tr-TR');
                const fullName = (student.fullName || "").toLocaleLowerCase('tr-TR');
                const email = (student.email || "").toLocaleLowerCase('tr-TR');
                const phone = (student.phoneNumber || "").toLocaleLowerCase('tr-TR');

                if (!fullName.includes(q) && !email.includes(q) && !phone.includes(q)) {
                    continue;
                }
            }

            items.push({
                id: `${student.id}_${def.id}_${periodKey}`,
                submissionId: sub?.id || null,
                userId: student.id,
                studentName: student.fullName,
                studentEmail: student.email,
                studentPhone: student.phoneNumber,
                applicationId: app.id,
                fundName: fundName,
                period: def.isPeriodic ? periodText : null,
                periodName: def.isPeriodic ? (seasonObj?.period || periodText) : "Tüm Dönemler (Tek Seferlik)",
                definitionId: def.id,
                documentName: def.name,
                isPeriodic: def.isPeriodic,
                isReceived: isReceived,
                receivedAt: sub?.receivedAt || null,
                receivedByAdminName: sub?.receiverName || null,
            });
        }
    }

    // İsim sırasına göre sırala
    items.sort((a, b) => a.studentName.localeCompare(b.studentName, 'tr-TR'));

    const stats = {
        total: items.length,
        received: items.filter(i => i.isReceived).length,
        pending: items.filter(i => !i.isReceived).length,
    };

    return {
        definitions,
        items,
        seasons,
        currentPeriod: targetPeriod,
        stats
    };
}

export async function toggleSignedDocumentSubmission(data: {
    documentDefinitionId: string;
    userId: string;
    applicationId?: string;
    period?: string | null;
    isReceived: boolean;
    notes?: string;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) {
        throw new Error("Oturum bulunamadı veya yetkisiz erişim.");
    }

    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işlemi yapmaya yetkiniz bulunmuyor.");
    }

    // Doküman tanımını çekerek dönem bazlı mı kontrol et
    const [def] = await db.select()
        .from(signedDocumentDefinitions)
        .where(
            and(
                eq(signedDocumentDefinitions.id, data.documentDefinitionId),
                eq(signedDocumentDefinitions.tenantId, tenantData.tenantId)
            )
        )
        .limit(1);

    if (!def) {
        throw new Error("Doküman tanımı bulunamadı.");
    }

    const effectivePeriod = def.isPeriodic ? (data.period || null) : null;

    // Mevcut kaydı ara
    const whereConditions = [
        eq(signedDocumentSubmissions.tenantId, tenantData.tenantId),
        eq(signedDocumentSubmissions.documentDefinitionId, data.documentDefinitionId),
        eq(signedDocumentSubmissions.userId, data.userId),
    ];

    if (effectivePeriod) {
        whereConditions.push(eq(signedDocumentSubmissions.period, effectivePeriod));
    } else {
        whereConditions.push(isNull(signedDocumentSubmissions.period));
    }

    const [existing] = await db.select()
        .from(signedDocumentSubmissions)
        .where(and(...whereConditions))
        .limit(1);

    const now = new Date();
    const receiverId = data.isReceived ? tenantData.userId : null;
    const receivedTime = data.isReceived ? now : null;

    if (existing) {
        await db.update(signedDocumentSubmissions)
            .set({
                isReceived: data.isReceived,
                receivedAt: receivedTime,
                receivedBy: receiverId,
                notes: data.notes !== undefined ? data.notes : existing.notes,
                updatedAt: now,
            })
            .where(eq(signedDocumentSubmissions.id, existing.id));
    } else {
        await db.insert(signedDocumentSubmissions).values({
            tenantId: tenantData.tenantId,
            documentDefinitionId: data.documentDefinitionId,
            userId: data.userId,
            applicationId: data.applicationId || null,
            period: effectivePeriod,
            isReceived: data.isReceived,
            receivedAt: receivedTime,
            receivedBy: receiverId,
            notes: data.notes || null,
            createdAt: now,
            updatedAt: now,
        });
    }

    revalidatePath('/dashboard/admin/document-tracking');
    return { success: true, isReceived: data.isReceived };
}
