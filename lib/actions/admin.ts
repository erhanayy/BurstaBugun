"use server";

import { db } from "@/lib/db";
import { applications, users, references, fundSelections, funds } from "@/lib/db/schema";
import { eq, inArray, and, or, sql } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { sendEmail, EMAIL_CODES } from "@/lib/email";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export async function getAdminApplicants(statusFilter?: string, periodFilter?: string, activeStatus?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) return [];
    
    // Yalnızca admin veya süper adminler erişebilir
    if (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin) {
        throw new Error("Bu işleme yetkiniz yok.");
    }

    let conditions = [eq(applications.tenantId, tenantData.tenantId)];

    if (periodFilter) {
        conditions.push(eq(applications.period, periodFilter));
    }

    if (!activeStatus || activeStatus === 'active') {
        conditions.push(eq(applications.isActive, true));
    } else if (activeStatus === 'inactive') {
        conditions.push(eq(applications.isActive, false));
    }

    if (statusFilter === 'draft') {
        conditions.push(eq(applications.status, 'draft'));
    } else if (statusFilter === 'waiting_reference') {
        conditions.push(eq(applications.status, 'waiting_reference'));
    } else if (statusFilter === 'in_pool') {
        conditions.push(eq(applications.status, 'in_pool'));
    } else if (statusFilter === 'selected') {
        conditions.push(inArray(applications.status, ['selected', 'active']));
    }

    const apps = await db.query.applications.findMany({
        where: and(...conditions),
        with: {
            user: true,
            references: {
                where: eq(references.status, 'pending') // Yalnızca onay bekleyen referansları getir
            },
            fund: {
                with: {
                    owner: true
                }
            },
            selections: {
                where: eq(fundSelections.isActive, true),
                with: {
                    fund: {
                        with: {
                            owner: true
                        }
                    }
                }
            }
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)]
    });

    return apps;
}

export async function getAdminApplicantCounts(periodFilter?: string, activeStatus?: string, searchQuery?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) return { draft: 0, waiting_reference: 0, in_pool: 0, selected: 0 };

    let conditions = [eq(applications.tenantId, tenantData.tenantId)];

    if (periodFilter) {
        conditions.push(eq(applications.period, periodFilter));
    }

    if (!activeStatus || activeStatus === 'active') {
        conditions.push(eq(applications.isActive, true));
    } else if (activeStatus === 'inactive') {
        conditions.push(eq(applications.isActive, false));
    }

    if (searchQuery) {
        conditions.push(sql`LOWER(${users.fullName}) LIKE LOWER(${`%${searchQuery}%`})`);
    }

    const result = await db.select({
        status: applications.status,
        count: sql<number>`count(*)::int`
    })
    .from(applications)
    .leftJoin(users, eq(applications.userId, users.id))
    .where(and(...conditions))
    .groupBy(applications.status);

    const counts = {
        draft: 0,
        waiting_reference: 0,
        in_pool: 0,
        selected: 0
    };

    result.forEach(row => {
        if (row.status === 'draft') counts.draft += row.count;
        if (row.status === 'waiting_reference') counts.waiting_reference += row.count;
        if (row.status === 'in_pool') counts.in_pool += row.count;
        if (row.status === 'selected' || row.status === 'active') counts.selected += row.count;
    });

    return counts;
}

export async function getUsersWithMultipleApps(periodFilter?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) return [];

    let conditions = [
        eq(applications.tenantId, tenantData.tenantId),
        eq(applications.isActive, true) // Sadece aktif başvuruları say
    ];

    if (periodFilter) {
        conditions.push(eq(applications.period, periodFilter));
    }

    const result = await db.select({
        userId: applications.userId,
        count: sql<number>`count(*)::int`
    })
    .from(applications)
    .where(and(...conditions))
    .groupBy(applications.userId)
    .having(sql`count(*) > 1`);

    return result.map(r => r.userId);
}

export async function toggleApplicationActiveStatus(appId: string, currentStatus: boolean) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) throw new Error("Unauthorized");

    await db.update(applications)
        .set({ isActive: !currentStatus })
        .where(and(
            eq(applications.id, appId),
            eq(applications.tenantId, tenantData.tenantId)
        ));

    revalidatePath("/dashboard/admin/applicants");
    return { success: true };
}

export async function sendApplicantReminderEmail(appId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !tenantData.tenantId) throw new Error("Unauthorized");

    const app = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, appId),
            eq(applications.tenantId, tenantData.tenantId)
        ),
        with: { user: true }
    });

    if (!app || !app.user?.email) throw new Error("Kullanıcı veya e-posta bulunamadı.");

    const daysWaiting = formatDistanceToNow(new Date(app.createdAt), { locale: tr });
    
    let stageStr = "";
    if (app.status === 'draft') stageStr = "Başvurunuz Devam Ediyor (Taslak)";
    if (app.status === 'waiting_reference') stageStr = "Referans Onayı Bekliyor";
    if (app.status === 'in_pool') stageStr = "Havuzda (Değerlendirme Aşamasında)";

    const emailBody = `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Başvurunuz Hakkında Hatırlatma</h2>
            <p>Sayın <strong>${app.user.fullName}</strong>,</p>
            <p>Burs başvurunuz <strong>${daysWaiting}</strong> süredir <strong>${stageStr}</strong> aşamasında beklemektedir.</p>
            <p>Sürecinizin ilerleyebilmesi için lütfen ilgili adımları tamamlayınız veya eksiklerinizi gideriniz.</p>
            <br/>
            <p>Saygılarımızla,</p>
            <p><strong>${tenantData.tenantName || 'Burs Sistemi'}</strong></p>
        </div>
    `;

    const result = await sendEmail({
        code: EMAIL_CODES.BILDIRIM,
        sentTo: app.user.email,
        subject: "Burs Başvurunuz Hakkında Hatırlatma",
        body: emailBody,
        screen: "/dashboard/admin/applicants",
    });

    if (!result.success) {
        throw new Error("E-posta gönderilemedi.");
    }

    return { success: true };
}

export async function getExcelExportDataAction(periodFilter: string, activeStatus: string, searchQuery: string) {
    const allApps = await getAdminApplicants(undefined, periodFilter, activeStatus);
    
    // Uygula searchQuery filtrelemesi
    const filteredApps = allApps.filter(app => {
        if (!searchQuery) return true;
        const name = (app.user?.fullName || "").toLocaleLowerCase('tr-TR');
        const query = searchQuery.toLocaleLowerCase('tr-TR');
        return name.includes(query);
    });

    // Sırala ve maple
    return filteredApps.sort((a, b) => {
        const nameA = (a.user?.fullName || "").trim().toLocaleLowerCase('tr-TR');
        const nameB = (b.user?.fullName || "").trim().toLocaleLowerCase('tr-TR');
        return nameA.localeCompare(nameB, 'tr-TR');
    }).map(app => {
        const fullName = app.user?.fullName?.trim() || "";
        const nameParts = fullName.split(" ");
        let firstName = fullName;
        let lastName = "";
        if (nameParts.length > 1) {
            lastName = nameParts.pop() || "";
            firstName = nameParts.join(" ");
        }

        let statusTr = app.status;
        switch (app.status) {
            case 'draft': statusTr = 'Başvurusu Devam Eden'; break;
            case 'waiting_reference': statusTr = 'Referans Aşamasında'; break;
            case 'in_pool': statusTr = 'Havuzdakiler'; break;
            case 'selected': 
            case 'active': statusTr = 'Seçilmişler'; break;
            case 'rejected': statusTr = 'Reddedildi'; break;
        }

        let fundName = "-";
        let fundOwner = "-";
        
        if (app.selections && app.selections.length > 0) {
            const selection = app.selections[0];
            fundName = selection.fund?.title || "-";
            fundOwner = selection.fund?.owner?.fullName || "-";
        } else if (app.fund) {
            fundName = app.fund.title || "-";
            fundOwner = app.fund.owner?.fullName || "-";
        }

        return {
            "Bursiyer Adı": firstName,
            "Soyadı": lastName,
            "Email Adresi": app.user?.email || "-",
            "Telefonu": app.user?.phoneNumber || "-",
            "Statü": statusTr,
            "Fonu": fundName,
            "Fon Sahibi": fundOwner
        };
    });
}
