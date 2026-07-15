import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { getExemptionRequests } from "@/lib/actions/reference";
import { ShieldAlert } from "lucide-react";
import ExemptionsClient from "./exemptions-client";

export const metadata = {
    title: "Eski Bursiyer Muafiyet Onayları | BurstaBugün",
    description: "Eski bursiyerlik beyanında bulunan öğrencilerin referans muafiyetlerini yönetin",
};

export default async function AdminExemptionsPage() {
    const tenantData = await getCurrentTenant();

    if (!tenantData || tenantData.userRole !== 'admin') {
        return <RedirectToLogin />;
    }

    const requests = await getExemptionRequests();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-blue-600" />
                    Eski Bursiyer Muafiyet Onayları
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Eski bursiyer olduğunu beyan eden öğrencilerin referans (Muhtar, Akademisyen) sürecinden muaf tutulup doğrudan havuza alınması için bu listeden onay verebilir veya reddedebilirsiniz.
                </p>
            </div>

            <ExemptionsClient initialRequests={requests} />
        </div>
    );
}
