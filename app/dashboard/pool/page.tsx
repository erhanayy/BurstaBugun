import { getApplicationPool, getSponsorFunds, getStudentsAllocationsStats } from "@/lib/actions/sponsor";
import { getSystemParameter } from "@/lib/actions/parameters";
import { SelectionButton } from "./selection-button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { maskFullName } from "@/lib/utils";
import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { parametersTenantSeasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { FundSelector } from "./fund-selector";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PoolPage({ searchParams }: { searchParams: Promise<{ fundId?: string }> }) {
    const myFunds = await getSponsorFunds();
    const eligibleFunds = myFunds;

    const parsedParams = await searchParams;
    const specificFundId = parsedParams?.fundId || (eligibleFunds.length > 0 ? eligibleFunds[0].id : "");

    const selectedFund = eligibleFunds.find(f => f.id === specificFundId);
    const fundPeriod = selectedFund?.period || null;

    const poolData = await getApplicationPool(fundPeriod);
    const sortedPoolData = [...poolData].sort((a, b) => {
        const nameA = (a.user?.fullName || "").toLocaleLowerCase('tr-TR');
        const nameB = (b.user?.fullName || "").toLocaleLowerCase('tr-TR');
        return nameA.localeCompare(nameB, 'tr-TR');
    });

    const userIds = Array.from(new Set(sortedPoolData.map((a: any) => a.userId)));
    const allocationStats = await getStudentsAllocationsStats(userIds);

    const capacity = selectedFund?.targetStudentCount !== null ? selectedFund?.targetStudentCount : Infinity;
    const filled = selectedFund?.selections?.length || 0;
    const isFundFull = capacity !== Infinity && filled >= capacity;

    // Dynamic System Param Limit
    const maxLimitStr = await getSystemParameter("MAX_MONTHLY_LIMIT", "5000");
    const maskNamesStr = await getSystemParameter("MASK_STUDENT_NAMES", "false");
    
    const tenantData = await getCurrentTenant();
    const shouldMask = maskNamesStr === "true" && tenantData?.userRole !== 'admin';

    // Fetch seasons to map period ID to period name
    let seasons: any[] = [];
    if (tenantData) {
        seasons = await db.query.parametersTenantSeasons.findMany({
            where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        });
    }
    
    const seasonMap = new Map();
    seasons.forEach(s => seasonMap.set(s.id, s.period));

    const eligibleFundsWithPeriodName = eligibleFunds.map(f => ({
        ...f,
        periodName: f.period && f.period !== "none" ? seasonMap.get(f.period) || f.period : 'Dönemsiz'
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Bursiyer Havuzu</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Fonlarınıza başvuran adayları inceleyin ve destekleyeceğiniz bursiyerleri seçin.
                    </p>
                </div>
            </div>

            {eligibleFundsWithPeriodName.length > 0 ? (
                <FundSelector funds={eligibleFundsWithPeriodName} currentFundId={specificFundId} />
            ) : null}

            {poolData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Havuz Şu An Boş</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Henüz fonlarınıza yapılmış ve onay bekleyen bir başvuru bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedPoolData.map((app) => {
                        let answers: any = {};
                        try {
                            if (app.answersJson) {
                                answers = JSON.parse(app.answersJson);
                            }
                        } catch (e) {
                            console.error("Failed to parse answers", e);
                        }

                        const isSelected = app.status === 'selected' || app.status === 'active';
                        const isOldStudent = app.isExemptionRequested;
                        const bgClass = isOldStudent ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800';

                        return (
                            <div key={app.id} className={`${bgClass} border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row relative`}>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'} mb-2`}>
                                                {isSelected ? (app.fund?.title || 'Seçildi') : 'Aday Havuzda'}
                                            </span>
                                            {isOldStudent && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-2">
                                                    Eski Bursiyer
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                {shouldMask ? maskFullName(app.user?.fullName) : app.user?.fullName}
                                                {isSelected && (
                                                    <CheckCircle2 className="ml-2 w-5 h-5 text-green-500" />
                                                )}
                                            </h3>
                                        </div>
                                        <div suppressHydrationWarning className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                                            {format(new Date(app.createdAt), "d MMMM yyyy", { locale: tr })}
                                        </div>
                                    </div>

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

                                    {answers.motivationLetter && (
                                        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-zinc-800">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider block mb-2">Motivasyon</span>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 italic">"{answers.motivationLetter}"</p>
                                        </div>
                                    )}

                                    {/* Burs Göstergesi */}
                                    {allocationStats[app.userId] > 0 && (
                                        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/40">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                                    Halihazırda Fona Dahil (Mevcut Alan: {allocationStats[app.userId]} TL / Ay)
                                                </p>
                                                <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 leading-tight">
                                                    Sistem limiti: {maxLimitStr} TL. Kalan boşluğu dikkate alarak fona seçin.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800 md:w-64">
                                    { (tenantData?.userRole === 'admin' || tenantData?.canSponsorSelectFromPool) && (
                                        <SelectionButton applicationId={app.id} fundId={specificFundId || app.fundId || ""} defaultSelected={isSelected} disabled={isFundFull} />
                                    )}
                                    <Link href={`/dashboard/applications/${app.id}`} className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        Tüm Detayları Gör
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
