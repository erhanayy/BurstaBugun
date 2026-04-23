import { getMyApplications } from "@/lib/actions/application";
import Link from "next/link";
import { PlusCircle, FileText, Calendar, Users, Eye, Edit, Wallet } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ApplicationsPage() {
    const applications = await getMyApplications();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Burs Başvurularım</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Şimdiye kadar yaptığınız tüm burs başvuruları ve referans süreçleri.
                    </p>
                </div>
                <Link
                    href="/dashboard/applications/new"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Başvuru Yap
                </Link>
            </div>

            {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Henüz Başvurunuz Yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        Aktif formlar üzerinden yeni bir başvuru oluşturarak eğitime destek almaya başlayabilirsiniz.
                    </p>
                    <Link
                        href="/dashboard/applications/new"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2"
                    >
                        Başvuru Formunu Aç
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app: any) => {
                        const approvedRefCount = app.references?.filter((r: any) => r.status === 'approved').length || 0;
                        const totalRefCount = app.references?.length || 0;

                        return (
                            <div key={app.id} className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg ${app.status === 'draft' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${app.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300' :
                                                (app.status === 'waiting_reference' || app.status === 'submitted') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                    app.status === 'in_pool' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {app.status === 'draft' ? 'Taslak' :
                                                (app.status === 'waiting_reference' || app.status === 'submitted') ? 'Referans Bekliyor' :
                                                    app.status === 'in_pool' ? 'Havuzda (Tamamlandı)' :
                                                        app.status === 'selected' || app.status === 'active' ? 'Burs İçin Seçildiniz' : 'İptal / Durduruldu'}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {app.form?.title || "Burs Başvuru Formu"}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(app.createdAt), "d MMMM yyyy", { locale: tr })}
                                    </div>

                                    {(app.status === 'waiting_reference' || app.status === 'submitted' || app.status === 'in_pool') && (
                                        <div className={`rounded-lg p-3 border ${approvedRefCount >= 2 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'}`}>
                                            <div className={`flex justify-between items-center text-sm font-medium mb-2 ${approvedRefCount >= 2 ? 'text-emerald-800 dark:text-emerald-300' : 'text-orange-800 dark:text-orange-300'}`}>
                                                <span>Referans Onayları İzleme Alanı</span>
                                                <span>{approvedRefCount} / 2 Tamamlandı</span>
                                            </div>
                                            <div className={`w-full rounded-full h-1.5 mb-3 ${approvedRefCount >= 2 ? 'bg-emerald-200/50 dark:bg-emerald-950/50' : 'bg-orange-200/50 dark:bg-orange-950/50'}`}>
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${approvedRefCount >= 2 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${(Math.min(approvedRefCount, 2) / 2) * 100}%` }}></div>
                                            </div>

                                            {app.references && app.references.length > 0 && (
                                                <div className={`mt-2 space-y-1.5 border-t pt-2 ${approvedRefCount >= 2 ? 'border-emerald-200/50 dark:border-emerald-900/30' : 'border-orange-200/50 dark:border-orange-900/30'}`}>
                                                    {app.references.map((r: any) => (
                                                        <div key={r.id} className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                {r.title === 'muhtar' ? 'Muhtar' : 'Hoca'}: {r.fullName}
                                                            </span>
                                                            <span className={`font-semibold px-2 py-0.5 rounded ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {r.status === 'approved' ? 'Onayladı' : r.status === 'rejected' ? 'Reddetti' : 'Bekleniyor'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* SEÇİLDİ DURUMUNDA BİLGİ KUTUSU */}
                                    {(app.status === 'selected' || app.status === 'active') && (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/30">
                                            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Destekleyen Kurum/Fon</h4>
                                            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{app.fund?.title || "Bursiyer Fonu"}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 flex flex-wrap gap-2">
                                    {app.status === 'draft' ? (
                                        <Link href="/dashboard/applications/new" className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg py-2">
                                            <Edit className="w-4 h-4" /> Formu Düzenle
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={`/dashboard/applications/${app.id}`} className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg py-2 whitespace-nowrap px-1">
                                                <Eye className="w-4 h-4" /> Formu Gör
                                            </Link>
                                            <Link href={`/dashboard/applications/${app.id}/references`} className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 border border-transparent rounded-lg py-2 whitespace-nowrap px-1">
                                                <Users className="w-4 h-4" /> Referanslar
                                            </Link>
                                            {(app.status === 'selected' || app.status === 'active') && (
                                                <Link href={`/dashboard/applications/${app.id}/payments`} className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-transparent rounded-lg py-2 whitespace-nowrap px-1 basis-full md:basis-auto mt-2 md:mt-0">
                                                    <Wallet className="w-4 h-4" /> Ödemeler
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
