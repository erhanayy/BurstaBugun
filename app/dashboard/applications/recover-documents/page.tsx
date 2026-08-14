import { getCurrentTenant } from "@/lib/data/tenant";
import { RedirectToLogin } from "@/components/redirect-to-login";
import { UploadCloud } from "lucide-react";
import RecoverClient from "./recover-client";
import { getMyApplications } from "@/lib/actions/application";

export const metadata = {
    title: "Eksik Evrak Yükle | BurstaBugün",
    description: "Burs başvurunuzdaki eksik veya silinmiş evrakları yeniden yükleyin",
};

export default async function RecoverDocumentsPage() {
    const tenantData = await getCurrentTenant();

    if (!tenantData) {
        return <RedirectToLogin />;
    }

    const applications = await getMyApplications();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                    <UploadCloud className="w-6 h-6 text-blue-600" />
                    Eksik Evrak Yükleme Paneli
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Sistem altyapısındaki bir güncelleme nedeniyle başvurunuza eklediğiniz bazı belgeler (Okul Öğrenci Belgesi, Transkript, Sabıka Kaydı) silinmiş olabilir. Lütfen aşağıdaki alandan başvurunuzu seçip ilgili belgeleri yeniden yükleyiniz.
                </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-amber-800 dark:text-amber-200 text-sm mb-6">
                <strong>Bilgilendirme:</strong> Bu ekrandan yüklediğiniz dosyalar doğrudan Google Cloud kalıcı belleğine yüklenecektir ve bir daha kaybolmayacaktır. Anlayışınız için teşekkür ederiz.
            </div>

            <RecoverClient applications={applications} />
        </div>
    );
}
