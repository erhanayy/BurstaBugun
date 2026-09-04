import { getAdminApplicants, getAdminApplicantCounts, getUsersWithMultipleApps } from "@/lib/actions/admin";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, FileText, CheckCircle2, Clock, Mail, Phone, ExternalLink, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parametersTenantSeasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PeriodSelector } from "./period-selector";
import { ActiveSelector } from "./active-selector";
import { ApplicantActions } from "./applicant-actions";
import { SearchBar } from "./search-bar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminApplicantsPage({ searchParams }: { searchParams: Promise<{ status?: string, period?: string, active?: string, q?: string }> }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        redirect("/dashboard/home");
    }

    const parsedParams = await searchParams;
    const currentStatus = parsedParams?.status || 'in_pool';
    const activeStatus = parsedParams?.active || 'active';
    const searchQuery = parsedParams?.q || '';

    const seasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (s, { desc }) => [desc(s.period)]
    });

    const activeSeason = seasons.find(s => s.isActive) || seasons[0];
    const currentPeriod = parsedParams?.period || activeSeason?.id || '';

    const applicants = await getAdminApplicants(currentStatus, currentPeriod, activeStatus);
    const counts = await getAdminApplicantCounts(currentPeriod, activeStatus, searchQuery);
    const multiAppUserIds = await getUsersWithMultipleApps(currentPeriod);

    const sortedApplicants = [...applicants].sort((a, b) => {
        const nameA = (a.user?.fullName || "").toLocaleLowerCase('tr-TR');
        const nameB = (b.user?.fullName || "").toLocaleLowerCase('tr-TR');
        return nameA.localeCompare(nameB, 'tr-TR');
    }).filter(app => {
        if (!searchQuery) return true;
        const name = (app.user?.fullName || "").toLocaleLowerCase('tr-TR');
        const query = searchQuery.toLocaleLowerCase('tr-TR');
        return name.includes(query);
    });

    const tabs = [
        { id: 'draft', label: 'Başvurusu Devam Edenler', icon: Clock, count: counts.draft },
        { id: 'waiting_reference', label: 'Referans Aşamasında', icon: Users, count: counts.waiting_reference },
        { id: 'in_pool', label: 'Havuzdakiler', icon: FileText, count: counts.in_pool },
        { id: 'selected', label: 'Havuzdan Seçilmişler', icon: CheckCircle2, count: counts.selected }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Bursiyer Takip</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Sistemdeki tüm öğrenci başvurularını filtreleyin ve durumlarını detaylı takip edin.
                    </p>
                </div>
                
                {/* Selectors Row - Unified Background */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden p-1 gap-1">
                    {/* Search Bar */}
                    <div className="flex-1 flex items-center min-w-0">
                        <SearchBar defaultValue={searchQuery} />
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-zinc-800" />

                    {/* Active Selector */}
                    <div className="flex items-center space-x-2 px-3 w-full sm:w-auto">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <div className="w-full sm:w-48">
                            <ActiveSelector activeStatus={activeStatus} currentStatus={currentStatus} currentPeriod={currentPeriod} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-zinc-800" />

                    {/* Period Selector */}
                    <div className="flex items-center space-x-2 px-3 pr-4 w-full sm:w-auto">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="w-full sm:w-56">
                            <PeriodSelector seasons={seasons} currentPeriod={currentPeriod} currentStatus={currentStatus} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Header */}
            <div className="flex overflow-x-auto w-full space-x-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
                {tabs.map(tab => (
                    <Link
                        key={tab.id}
                        href={`/dashboard/admin/applicants?status=${tab.id}&period=${currentPeriod}`}
                        className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                            currentStatus === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 mr-2 ${currentStatus === tab.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`} />
                        {tab.label}
                        {tab.count !== null && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                currentStatus === tab.id 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {sortedApplicants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Kayıt Bulunamadı</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Bu filtreye uygun herhangi bir öğrenci başvurusu bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedApplicants.map((app) => {
                        let answers: any = {};
                        try {
                            if (app.answersJson) {
                                answers = JSON.parse(app.answersJson);
                            }
                        } catch (e) {
                            console.error("Failed to parse answers", e);
                        }

                        const isOldStudent = app.isExemptionRequested;
                        const hasMultipleApps = multiAppUserIds.includes(app.userId);
                        const isAppActive = app.isActive;
                        
                        let bgClass = 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800';
                        if (!isAppActive) {
                            bgClass = 'bg-gray-100 dark:bg-zinc-800/80 border-gray-300 dark:border-zinc-700 opacity-75';
                        } else if (hasMultipleApps) {
                            bgClass = 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-800/50';
                        } else if (isOldStudent) {
                            bgClass = 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800';
                        }

                        return (
                            <div key={app.id} className={`${bgClass} border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative transition-all`}>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                {app.user?.fullName}
                                                {app.status === 'selected' || app.status === 'active' ? (
                                                    <CheckCircle2 className="ml-2 w-5 h-5 text-green-500" />
                                                ) : null}
                                            </h3>
                                            
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                {app.user?.email && (
                                                    <div className="flex items-center">
                                                        <Mail className="w-4 h-4 mr-1.5 opacity-70" />
                                                        {app.user.email}
                                                    </div>
                                                )}
                                                {answers.phone && (
                                                    <div className="flex items-center">
                                                        <Phone className="w-4 h-4 mr-1.5 opacity-70" />
                                                        {answers.phone}
                                                    </div>
                                                )}
                                                {isOldStudent && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                        ESKİ BURSİYER
                                                    </span>
                                                )}
                                                {!isAppActive && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-600">
                                                        PASİF BAŞVURU
                                                    </span>
                                                )}
                                                {hasMultipleApps && isAppActive && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                                                        ⚠️ BİRDEN FAZLA BAŞVURU
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div suppressHydrationWarning className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                                            {format(new Date(app.createdAt), "d MMMM yyyy", { locale: tr })}
                                        </div>
                                    </div>

                                    {/* Referans Uyarısı */}
                                    {currentStatus === 'waiting_reference' && app.references && app.references.length > 0 && (
                                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Bekleyen Referans Onayı</span>
                                            <div className="text-sm text-red-900 dark:text-red-300 mt-1">
                                                {app.references.map(ref => (
                                                    <div key={ref.id}>• {ref.fullName} ({ref.email}) - Unvan: {ref.title}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Atandığı Fon Bilgisi */}
                                    {(currentStatus === 'selected') && app.fund && (
                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Eşleştiği Fon</span>
                                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mt-1">
                                                    {app.fund.title}
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:mt-0 text-sm text-blue-800 dark:text-blue-300">
                                                Sponsor: <span className="font-medium">{app.fund.owner?.fullName || 'Bilinmiyor'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dynamic Keys Extraction for safe fallback */}
                                    {(() => {
                                        const keys = Object.keys(answers);
                                        const schoolName = keys.find(k => k.toLowerCase().includes("okul") || k.toLowerCase().includes("üni")) ? answers[keys.find(k => k.toLowerCase().includes("okul") || k.toLowerCase().includes("üni")) as string] : "-";
                                        const progName = keys.find(k => k.toLowerCase().includes("bölüm") || k.toLowerCase().includes("program")) ? answers[keys.find(k => k.toLowerCase().includes("bölüm") || k.toLowerCase().includes("program")) as string] : "-";
                                        const gpa = keys.find(k => k.toLowerCase().includes("not") || k.toLowerCase().includes("gpa") || k.toLowerCase().includes("gano")) ? answers[keys.find(k => k.toLowerCase().includes("not") || k.toLowerCase().includes("gpa") || k.toLowerCase().includes("gano")) as string] : "-";
                                        const income = keys.find(k => k.toLowerCase().includes("gelir")) ? answers[keys.find(k => k.toLowerCase().includes("gelir")) as string] : "-";

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm mt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Okul / Üniversite</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{schoolName}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Bölüm / Program</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{progName}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Not Ortalaması</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{gpa}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Hane Geliri</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{income}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800 md:w-56 gap-2">
                                    <Link 
                                        href={`/dashboard/applications/${app.id}`} 
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Detayları Gör
                                    </Link>
                                    
                                    <ApplicantActions appId={app.id} isActive={app.isActive} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
