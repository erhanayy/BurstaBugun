import { auth } from "@/auth";
import { getCurrentTenant } from "@/lib/data/tenant";
import { PeriodFilter } from "./period-filter";
import { getDashboardPeriods, getAdminDashboardData, getSponsorDashboardData, getReferenceDashboardData, getApplicantDashboardData } from "@/lib/actions/dashboard";
import { Users, Wallet, CheckCircle2, DollarSign, TrendingUp, Presentation, Users2, GraduationCap, Clock, ShieldCheck, CalendarCheck, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
    const session = await auth();
    const tenantData = await getCurrentTenant();

    if (!tenantData) return null;

    const resolvedParams = await searchParams;
    const period = resolvedParams?.period || null;

    const periods = await getDashboardPeriods();

    // Fetch data for all roles the user might have
    const adminData = await getAdminDashboardData(period);
    const sponsorData = await getSponsorDashboardData(period);
    const refData = await getReferenceDashboardData(period);
    const applicantData = await getApplicantDashboardData(period);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Hoş Geldiniz, {tenantData?.userName || session?.user?.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        BurstaBugün portalı genel {period ? `(${period} Dönemi)` : "(Tüm Zamanlar)"} platform profiliniz.
                    </p>
                </div>
                {periods.length > 0 && (
                    <PeriodFilter periods={periods} currentPeriod={period} />
                )}
            </div>

            {/* ADMIN PANEL */}
            {adminData && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-zinc-800">
                        <Presentation className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Sistem Özeti</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Users2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Toplam Kullanıcı</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminData.totalUsers}</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif Fonlar</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminData.activeFunds}</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">30 Günlük Aktivite</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{adminData.recentActiveUsers || "-"}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SPONSOR / BAĞIŞÇI PANEL */}
            {sponsorData && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-zinc-800">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fonlarım ve Finansal Profilim</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-center">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Kurucusu Olduğum</p>
                            <h3 className="text-2xl font-extrabold text-blue-900 dark:text-blue-300">{sponsorData.ownedFundsCount} <span className="text-sm font-medium text-blue-700/50">Fon</span></h3>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-center">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Katılımcısı Olduğum</p>
                            <h3 className="text-2xl font-extrabold text-blue-900 dark:text-blue-300">{sponsorData.participatedFundsCount} <span className="text-sm font-medium text-blue-700/50">Fon</span></h3>
                        </div>
                        <div className="col-span-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex flex-col justify-center items-center">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Toplam Desteklenen Öğrenci</p>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-emerald-500" />
                                <h3 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-300">{sponsorData.totalSelectedStudents}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5">
                                <DollarSign className="w-32 h-32" />
                            </div>
                            <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 z-10">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div className="z-10">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gerçekleşen Eğitime Destek</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{sponsorData.totalPaid.toLocaleString('tr-TR')} ₺</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-500">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 z-10">
                                <DollarSign className="h-8 w-8" />
                            </div>
                            <div className="z-10">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bekleyen / Gelecek Taahhüt</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{sponsorData.totalPending.toLocaleString('tr-TR')} ₺</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REFERENCES PANEL */}
            {refData && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-zinc-800">
                        <Users2 className="h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Referans Gözlemlerim</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Referans Olduğum</p>
                            <h3 className="text-4xl font-black text-purple-600 dark:text-purple-400">{refData.totalStudents} <span className="text-lg font-medium text-purple-400/70">Genç</span></h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Öğrencilerimin Aldığı Destek</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{refData.totalPaid.toLocaleString('tr-TR')} ₺</h3>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Gelecek Öğrenci Hakedişleri</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{refData.totalPending.toLocaleString('tr-TR')} ₺</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* BURSİYER / APPLICANT PANEL */}
            {applicantData && (
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-zinc-800">
                        <GraduationCap className="h-5 w-5 text-fuchsia-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Öğrencilik / Burs Profilim</h2>
                    </div>

                    {/* Applicant Status Banner */}
                    <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider mb-1">Başvuru / Fon Durumu</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {applicantData.status === 'in_pool' && "Aday Havuzunda (Bekleniyor)"}
                                {applicantData.status === 'selected' && "Bursiyer Olarak SEÇİLDİ!"}
                                {applicantData.status === 'active' && "Aktif Bursiyer"}
                                {applicantData.status === 'draft' && "Taslak (Başvuru Tamamlanmadı)"}
                                {applicantData.status === 'waiting_reference' && "Referans Onayları Bekleniyor"}
                            </h3>
                            {applicantData.fundTitle && applicantData.status !== 'in_pool' && (
                                <p className="text-fuchsia-600 dark:text-fuchsia-500 font-medium text-sm mt-1 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Burs veren fon: <strong>{applicantData.fundTitle}</strong>
                                </p>
                            )}
                        </div>

                        {applicantData.totalRefs > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-lg flex items-center gap-3">
                                <ShieldCheck className="h-8 w-8 text-fuchsia-500 opacity-80" />
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Referanslarım</p>
                                    <p className="font-bold text-gray-900 dark:text-zinc-100 text-sm">
                                        {applicantData.approvedRefs} / {applicantData.totalRefs} Onaylandı
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Applicant Financials */}
                    {(applicantData.totalReceived > 0 || applicantData.totalPending > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bugüne Kadarki Burs</p>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{applicantData.totalReceived.toLocaleString('tr-TR')} ₺</h3>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        <Clock3 className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bekleyen Kalan Tutar</p>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{applicantData.totalPending.toLocaleString('tr-TR')} ₺</h3>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <CalendarCheck className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sıradaki Ödeme</p>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {applicantData.nextPaymentDate ? format(new Date(applicantData.nextPaymentDate), "d MMMM yyyy", { locale: tr }) : "Belli Değil"}
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!adminData && !sponsorData && !refData && !applicantData && (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-full mb-6 text-gray-400">
                        <Presentation className="h-12 w-12" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz Görüntüleyecek Detay Yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Şu an için profilinizde listelenebilecek aktif bir sponsorluk, fon veya yönetici işlemi bulunmuyor.
                    </p>
                </div>
            )}
        </div>
    );
}
