import { getApplicationPool, getSponsorFunds } from "@/lib/actions/sponsor";
import { SelectionButton } from "./selection-button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FundSelector } from "./fund-selector";

export default async function PoolPage({ searchParams }: { searchParams: Promise<{ fundId?: string }> }) {
    const poolData = await getApplicationPool();
    const myFunds = await getSponsorFunds();

    const eligibleFunds = myFunds.filter(f => {
        if (!f.invitations || f.invitations.length === 0) return true;
        return f.invitations.every((inv: any) => inv.status === 'accepted');
    });

    const parsedParams = await searchParams;
    const specificFundId = parsedParams?.fundId || (eligibleFunds.length === 1 ? eligibleFunds[0].id : "");

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

            {eligibleFunds.length > 0 ? (
                <FundSelector funds={eligibleFunds} currentFundId={specificFundId} />
            ) : myFunds.length > 0 ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-sm mb-6">
                    <strong>Bilgi: </strong> Sahibi olduğunuz veya katıldığınız fonlara gönderilen davetlerden henüz onaylanmamış olanlar bulunmaktadır. Havuzdan bursiyer seçebilmek için <strong>tüm katılımcıların davetleri kabul etmesi</strong> gerekmektedir.
                </div>
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
                    {poolData.map((app) => {
                        let answers: any = {};
                        try {
                            if (app.answersJson) {
                                answers = JSON.parse(app.answersJson);
                            }
                        } catch (e) {
                            console.error("Failed to parse answers", e);
                        }

                        const isSelected = app.status === 'selected' || app.status === 'active';

                        return (
                            <div key={app.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'} mb-2`}>
                                                {isSelected ? (app.fund?.title || 'Seçildi') : 'Aday Havuzda'}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                {app.user?.fullName}
                                                {isSelected && (
                                                    <CheckCircle2 className="ml-2 w-5 h-5 text-green-500" />
                                                )}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
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
                                </div>

                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-zinc-800 md:w-64">
                                    <SelectionButton applicationId={app.id} fundId={specificFundId || app.fundId || ""} defaultSelected={isSelected} />
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
