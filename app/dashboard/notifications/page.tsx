import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { Bell } from "lucide-react";
import NotificationsClient from "./notifications-client";
import { getNotifications } from "@/lib/actions/notification";

export const metadata = {
    title: "Bildirimlerim | BurstaBugün",
    description: "Geçmiş tüm bildirimlerinizi görüntüleyin.",
};

export default async function NotificationsPage() {
    const tenantData = await getCurrentTenant();

    if (!tenantData || !tenantData.userId) {
        return <RedirectToLogin />;
    }

    // Geriye dönük geniş çaplı bildirim getirme (Örn 200 adet)
    const notifications = await getNotifications(tenantData.tenantId, tenantData.userId, 200);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-blue-600" />
                        Bildirimlerim
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Hesabınızla ilgili tüm geçmiş bildirimleri ve bilgilendirmeleri buradan takip edebilirsiniz.
                    </p>
                </div>
            </div>

            <NotificationsClient initialData={notifications} tenantId={tenantData.tenantId} userId={tenantData.userId} />
        </div>
    );
}
