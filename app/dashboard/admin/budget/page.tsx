import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { getBudgetDashboardData } from "@/lib/actions/budget";
import { BudgetDashboard } from "./budget-dashboard";
import { PieChart, Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Dönemsel Bütçe ve Kasa Raporu | BurstaBugün",
    description: "Vakıf dönemsel bütçe, kasa ve nakit akışı yönetim raporu",
};

interface BudgetPageProps {
    searchParams: Promise<{ period?: string }>;
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
    const tenantData = await getCurrentTenant();

    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        return <RedirectToLogin />;
    }

    const resolvedParams = await searchParams;
    const periodId = resolvedParams?.period;

    const data = await getBudgetDashboardData(periodId);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                        <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Bütçe ve Kasa Raporu
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Dönemsel gelir, gider, burs dağıtımları, açılış bakiyeleri ve nakit akışı tablosu.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/bank-accounts">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 bg-white dark:bg-zinc-900">
                            <Landmark className="w-3.5 h-3.5 text-blue-600" />
                            Banka Hesapları
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Dashboard Component */}
            <BudgetDashboard initialData={data} />
        </div>
    );
}
