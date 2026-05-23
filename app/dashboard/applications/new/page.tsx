import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applicationForms, applications, parametersTenantSeasons } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import WizardClient from "./wizard-client";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewApplicationPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
    const sp = await searchParams;
    const tenant = await getCurrentTenant();
    if (!tenant) return redirect("/login");

    const now = new Date();
    // Sistemde kayıtlı kısıtları (sezon parametrelerini) alalım
    const allActiveSeasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenant.tenantId),
    });

    // Öğrenciye gösterilecek dönem listesi (Veritabanındaki Aktif Sezonlar)
    const activeSeasons = allActiveSeasons.filter(s => s.isActive);

    if (activeSeasons.length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pt-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Aktif Dönem Bulunmuyor</h3>
                    <p className="text-yellow-700 dark:text-yellow-300/80">
                        Şu anda sisteme tanımlanmış aktif bir eğitim dönemi bulunmamaktadır. Lütfen yönetimin Sistem Parametreleri ekranından yeni dönemi açmasını bekleyiniz.
                    </p>
                </div>
            </div>
        );
    }

    // If period is not selected, show selection screen
    if (!sp.period) {
        return (
            <div className="max-w-md mx-auto space-y-6 pt-12">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Başvuru Dönemi</h2>
                        <p className="text-gray-500 mt-2 text-sm">Lütfen başvurmak istediğiniz dönemi seçiniz.</p>
                    </div>
                    
                    <form action="/dashboard/applications/new" method="GET" className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dönem Seçiniz</label>
                            <select 
                                name="period" 
                                required
                                className="w-full h-11 px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seçiniz...</option>
                                {activeSeasons.map(season => (
                                    <option key={season.id} value={season.id}>{season.period}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            Devam Et
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const selectedSeasonId = sp.period;
    
    // Veritabanında bu dönem için bir kısıt (parametre) girilmiş mi?
    const selectedSeasonParams = allActiveSeasons.find(s => s.id === selectedSeasonId);

    if (!selectedSeasonParams) {
        return redirect("/dashboard/applications/new");
    }

    // Kısıt girilmişse ve aktifse tarihleri kontrol et
    if (selectedSeasonParams.isActive) {
        let isOpen = true;
        if (selectedSeasonParams.appStartDate && selectedSeasonParams.appEndDate) {
            isOpen = now >= selectedSeasonParams.appStartDate && now <= selectedSeasonParams.appEndDate;
        } else if (selectedSeasonParams.appStartDate) {
            isOpen = now >= selectedSeasonParams.appStartDate;
        } else if (selectedSeasonParams.appEndDate) {
            isOpen = now <= selectedSeasonParams.appEndDate;
        }

        if (!isOpen) {
            let dateRangeStr = "";
            if (selectedSeasonParams.appStartDate && selectedSeasonParams.appEndDate) {
                dateRangeStr = `${selectedSeasonParams.appStartDate.toLocaleDateString("tr-TR")} - ${selectedSeasonParams.appEndDate.toLocaleDateString("tr-TR")} tarihleri arasındadır.`;
            } else if (selectedSeasonParams.appStartDate) {
                dateRangeStr = `${selectedSeasonParams.appStartDate.toLocaleDateString("tr-TR")} tarihinden itibarendir.`;
            } else if (selectedSeasonParams.appEndDate) {
                dateRangeStr = `${selectedSeasonParams.appEndDate.toLocaleDateString("tr-TR")} tarihine kadardır.`;
            }

            return (
                <div className="max-w-4xl mx-auto space-y-6 pt-6">
                    <div className="mb-4">
                        <Link href="/dashboard/applications/new" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                            ← Dönem Seçimine Dön
                        </Link>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Başvuru Tarihleri Dışındasınız</h3>
                        <p className="text-red-700 dark:text-red-300/80 mb-2">
                            {selectedSeasonParams.period} dönemi için başvurular şu anda kapalıdır.
                        </p>
                        {dateRangeStr && (
                            <p className="text-red-800 dark:text-red-200 font-medium text-sm bg-red-100 dark:bg-red-900/50 inline-block px-3 py-1 rounded-md">
                                🗓️ Başvuru tarihleri: {dateRangeStr}
                            </p>
                        )}
                    </div>
                </div>
            );
        }
    }

    const activeForm = await db.query.applicationForms.findFirst({
        where: eq(applicationForms.tenantId, tenant.tenantId),
        orderBy: [desc(applicationForms.createdAt)],
    });

    if (!activeForm || !activeForm.steps || (activeForm.steps as any[]).length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pt-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Başvuru Formu Bulunamadı</h3>
                    <p className="text-yellow-700 dark:text-yellow-300/80">
                        Şu anda sistemde tanımlı güncel bir başvuru formu bulunmuyor. Lütfen yönetimin formu yayına almasını bekleyiniz.
                    </p>
                </div>
            </div>
        );
    }

    const existingDraft = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenant.userId),
            eq(applications.tenantId, tenant.tenantId),
            eq(applications.formId, activeForm.id),
            eq(applications.period, selectedSeasonId), // Aynı dönem için taslak ara
            eq(applications.status, "draft")
        ),
        orderBy: [desc(applications.createdAt)]
    });

    const lastCompletedApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenant.userId),
            eq(applications.tenantId, tenant.tenantId)
        ),
        orderBy: [desc(applications.createdAt)]
    });

    // Don't pass previous if the last completed is exactly the same as the current draft
    const previousAnswers = (lastCompletedApplication && lastCompletedApplication.id !== existingDraft?.id && lastCompletedApplication.answersJson)
        ? JSON.parse(lastCompletedApplication.answersJson)
        : null;

    return (
        <WizardClient
            form={activeForm}
            tenantId={tenant.tenantId}
            userId={tenant.userId}
            existingAnswers={existingDraft?.answersJson ? JSON.parse(existingDraft.answersJson) : {}}
            existingDraftId={existingDraft?.id || null}
            previousAnswers={previousAnswers}
            period={selectedSeasonId}
        />
    );
}
