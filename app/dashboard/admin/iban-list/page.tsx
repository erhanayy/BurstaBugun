import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { IbanClient } from "./iban-client";
import { parametersTenantSeasons, applications } from "@/lib/db/schema";
import { eq, and, or, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminIbanListPage({
    searchParams
}: {
    searchParams: Promise<{ period?: string, q?: string, status?: string }>
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        redirect("/dashboard/home");
    }

    const parsedParams = await searchParams;

    // 1. Fetch available periods
    const periodsRes = await db.select({ id: parametersTenantSeasons.id, period: parametersTenantSeasons.period })
        .from(parametersTenantSeasons)
        .where(eq(parametersTenantSeasons.tenantId, tenantData.tenantId))
        .orderBy(desc(parametersTenantSeasons.isActive), desc(parametersTenantSeasons.createdAt));
    
    const availablePeriods = periodsRes.map(p => ({ id: p.id, period: p.period }));
    
    let activePeriodId = parsedParams?.period;
    if (!activePeriodId && availablePeriods.length > 0) {
        activePeriodId = availablePeriods[0].id;
    }

    const searchQuery = parsedParams?.q || '';
    const statusFilter = parsedParams?.status || 'all';

    let studentsList: any[] = [];
    if (activePeriodId) {
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.tenantId, tenantData.tenantId),
                eq(applications.period, activePeriodId),
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: {
                user: true,
                fund: true
            }
        });

        studentsList = apps.map(app => ({
            applicationId: app.id,
            userId: app.user?.id,
            fullName: app.user?.fullName || "Bilinmeyen",
            email: app.user?.email || "",
            ibanName: app.user?.ibanName || "",
            iban: app.user?.iban || "",
            fundName: app.fund?.title || "Bilinmeyen Fon",
        })).sort((a, b) => {
            const nameA = (a.fullName || "").trim().toLocaleLowerCase('tr-TR');
            const nameB = (b.fullName || "").trim().toLocaleLowerCase('tr-TR');
            return nameA.localeCompare(nameB, 'tr-TR');
        }).filter(s => {
            if (searchQuery && !(s.fullName || "").toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))) {
                return false;
            }
            if (statusFilter === 'entered' && !s.iban) return false;
            if (statusFilter === 'missing' && s.iban) return false;
            return true;
        });
    }

    return (
        <IbanClient 
            periods={availablePeriods} 
            activePeriod={activePeriodId || ""}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            initialStudents={studentsList} 
        />
    );
}
