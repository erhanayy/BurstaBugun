import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { getAllSystemParameters, getSystemParameter } from "@/lib/actions/parameters";
import { ParametersForm } from "./parameters-form";
import { Settings2 } from "lucide-react";

export const metadata = {
    title: "Sistem Parametreleri | BurstaBugün",
    description: "Sistem genelindeki kısıtları ve parametreleri yönetin",
};

export default async function ParametersPage() {
    const tenantData = await getCurrentTenant();

    if (!tenantData || tenantData.userRole !== 'admin') {
        return <RedirectToLogin />;
    }

    // Default seed MAX_MONTHLY_LIMIT if not exists
    const maxLimitStr = await getSystemParameter("MAX_MONTHLY_LIMIT", "5000");

    const allParams = await getAllSystemParameters();

    // Prepare map for the form
    const paramMap = new Map();
    allParams.forEach(p => paramMap.set(p.key, p.value));

    // Fallbacks
    if (!paramMap.has("MAX_MONTHLY_LIMIT")) {
        paramMap.set("MAX_MONTHLY_LIMIT", "5000");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-blue-600" />
                    Sistem Parametreleri
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Buradan sistemin limitlerini ve kalıcı ayarlarını değiştirebilirsiniz. Değişiklikler anında tüm sisteme yansır.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 overflow-hidden">
                <ParametersForm
                    initialMaxLimit={paramMap.get("MAX_MONTHLY_LIMIT")}
                />
            </div>
        </div>
    );
}
