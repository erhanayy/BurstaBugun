import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { getTenantBankAccounts } from "@/lib/actions/bank-accounts";
import { BankAccountsManager } from "./bank-accounts-manager";
import { Landmark, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Banka ve Kasa Hesapları | BurstaBugün",
    description: "Vakıf banka hesaplarını ve kasa tanımlarını yönetin",
};

export default async function BankAccountsPage() {
    const tenantData = await getCurrentTenant();

    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        return <RedirectToLogin />;
    }

    const { accounts = [] } = await getTenantBankAccounts();

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Banka ve Kasa Hesapları
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Vakfınıza ait banka hesaplarını, IBAN bilgilerini ve kasa tanımlarını bu ekrandan yönetebilirsiniz.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/budget">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 bg-white dark:bg-zinc-900">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Bütçe Raporuna Git
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Component */}
            <BankAccountsManager initialAccounts={accounts as any} />
        </div>
    );
}
