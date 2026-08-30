import { db } from "@/lib/db";
import { funds, fundContributors, fundInvitations, fundSelections, applications, payments, users, parametersTenantSeasons } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, CreditCard, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import FundDetailTabs from "./fund-detail-tabs";
import BackButton from "./back-button";
import { toggleFundStatus } from "@/lib/actions/funds";

export default async function AdminFundDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return redirect("/unauthorized");
    }

    const resolvedParams = await params;
    const fundId = resolvedParams.id;

    // 1. Fetch Fund Details
    const fund = await db.query.funds.findFirst({
        where: and(eq(funds.id, fundId), eq(funds.tenantId, tenantData.tenantId)),
        with: {
            owner: true
        }
    });

    if (!fund) {
        return redirect("/dashboard/admin/funds");
    }

    // Get period name
    let periodName = fund.period || "Belirtilmemiş";
    if (fund.period) {
        const season = await db.query.parametersTenantSeasons.findFirst({
            where: and(
                eq(parametersTenantSeasons.id, fund.period),
                eq(parametersTenantSeasons.tenantId, tenantData.tenantId)
            )
        });
        if (season) {
            periodName = season.period;
        }
    }

    // 2. Fetch Contributors and Invitations
    const contributors = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fundId),
        with: {
            user: true
        }
    });

    const invitations = await db.query.fundInvitations.findMany({
        where: eq(fundInvitations.fundId, fundId),
        orderBy: [desc(fundInvitations.createdAt)]
    });

    // 3. Fetch Matched Students
    const selections = await db.query.fundSelections.findMany({
        where: eq(fundSelections.fundId, fundId),
        with: {
            application: {
                with: { user: true }
            },
            sponsor: true
        },
        orderBy: [desc(fundSelections.createdAt)]
    });

    // 4. Fetch Payments
    const fundPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, fundId),
        with: {
            application: {
                with: { user: true }
            }
        },
        orderBy: [desc(payments.createdAt)]
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {fund.title}
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                            fund.isActive 
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400"
                        }`}>
                            {fund.isActive ? "Aktif Fon" : "Tamamlanmış Fon"}
                        </span>
                        <form action={toggleFundStatus.bind(null, fund.id, !fund.isActive)}>
                            <button type="submit" className={`text-xs px-3 py-1 rounded-md font-medium border transition-colors ${
                                fund.isActive 
                                ? "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-800"
                                : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40"
                            }`}>
                                {fund.isActive ? "Fonu Pasife Al" : "Fonu Aktife Al"}
                            </button>
                        </form>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kurucu: {fund.owner?.fullName || "Bilinmiyor"} • Dönem: {periodName}
                    </p>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Öğrenci (Eşleşen / Hedef)</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selections.length} <span className="text-gray-400 text-lg">/ {fund.targetStudentCount}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Katılımcı (Bursveren)</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {contributors.length}
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">Toplam İşlem Hacmi</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {fundPayments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0).toLocaleString('tr-TR')} ₺
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">Oluşturulma Tarihi</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {format(new Date(fund.createdAt), "dd MMM yyyy", { locale: tr })}
                    </div>
                </div>
            </div>

            {/* Tabbed Content */}
            <FundDetailTabs 
                contributors={contributors} 
                invitations={invitations} 
                selections={selections} 
                payments={fundPayments} 
            />
        </div>
    );
}
