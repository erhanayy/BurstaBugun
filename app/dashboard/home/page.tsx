import { auth } from "@/auth";
import { getCurrentTenant } from "@/lib/data/tenant";

export default async function DashboardHome() {
    const session = await auth();
    const tenantData = await getCurrentTenant();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Hoş Geldiniz, {tenantData?.userName || session?.user?.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">
                BurstaBugün portalına giriş yaptınız. Lütfen menüden yapmak istediğiniz işlemi seçin.
            </p>
        </div>
    );
}
