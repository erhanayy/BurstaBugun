import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { getSignedDocumentTrackingData } from "@/lib/actions/signed-documents";
import { DocumentTrackingFilters } from "./document-tracking-filters";
import { DocumentTrackingTable } from "./document-tracking-table";
import { CheckSquare, Settings, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "İmzalı Evrak Takibi | BurstaBugün",
    description: "Fona seçilen bursiyerlerin ıslak imzalı evrak teslimat kontrolü ve takibi",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DocumentTrackingPage({
    searchParams,
}: {
    searchParams: Promise<{
        period?: string;
        documentId?: string;
        q?: string;
        status?: 'all' | 'received' | 'pending';
    }>;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        redirect("/dashboard/home");
    }

    const resolvedParams = await searchParams;
    const periodFilter = resolvedParams?.period;
    const documentIdFilter = resolvedParams?.documentId;
    const searchQuery = resolvedParams?.q;
    const receivedFilter = resolvedParams?.status;

    const data = await getSignedDocumentTrackingData({
        periodFilter,
        documentIdFilter,
        searchQuery,
        receivedFilter,
    });

    const activeSeasonObj = data.seasons.find(s => s.id === data.currentPeriod || s.period === data.currentPeriod);
    const activeSeasonName = activeSeasonObj?.period || data.currentPeriod || "Genel";

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Link href="/dashboard/admin/applicants" className="hover:text-gray-700 dark:hover:text-gray-200">
                            Bursiyer Yönetimi
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">İmzalı Evrak Takibi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                İmzalı Evrak Takibi
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Fona seçilen bursiyerlerin teslim ettiği ıslak imzalı evrakları kontrol edin ve işaretleyin
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/admin/required-documents"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
                    >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Evrak Tanımlarını Yönet</span>
                    </Link>
                </div>
            </div>

            {/* Uyarı: Eğer hiç doküman tanımı yoksa bilgilendir */}
            {data.definitions.length === 0 ? (
                <div className="p-8 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                        <h3 className="font-semibold text-base mb-1">Henüz İmzalı Evrak Tanımı Yapılmamış</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                            Bursiyerlerin evrak teslim durumunu takip edebilmek için önce hangi evrakların (Örn: KVKK Metni, Taahhütname) istendiğini tanımlamanız gerekmektedir.
                        </p>
                        <Link
                            href="/dashboard/admin/required-documents"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            <span>İlk Dokümanı Tanımla</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filtreler */}
                    <DocumentTrackingFilters
                        seasons={data.seasons}
                        definitions={data.definitions}
                        currentPeriod={data.currentPeriod || ""}
                        currentDocumentId={documentIdFilter || ""}
                        currentSearch={searchQuery || ""}
                        currentStatus={receivedFilter || "all"}
                    />

                    {/* Dikey Liste Tablosu */}
                    <DocumentTrackingTable
                        initialItems={data.items}
                        periodName={activeSeasonName}
                    />
                </>
            )}
        </div>
    );
}
