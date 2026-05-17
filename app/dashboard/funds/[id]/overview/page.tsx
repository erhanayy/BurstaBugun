import { db } from "@/lib/db";
import { funds, fundSelections } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { Calendar, Users, Eye, Wallet, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { tr } from "date-fns/locale";
import { format } from "date-fns";

export default async function FundOverviewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const fundId = params.id;

    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId),
        with: {
            selections: {
                where: eq(fundSelections.isActive, true),
                with: {
                    application: {
                        with: { user: true }
                    },
                    sponsor: true
                },
                orderBy: [asc(fundSelections.createdAt)]
            }
        }
    });

    if (!fund) redirect("/dashboard/funds");

    // Sadece fon sahibi veya admin bu sayfayı görebilir
    if (fund.ownerId !== tenantData.userId && tenantData.userRole !== "admin") {
        redirect(`/dashboard/funds/${fundId}/payment`);
    }

    const selections = fund.selections || [];
    
    // Toplam öğrenci ve üstlenilen öğrenci sayısı
    const totalStudents = selections.length;
    const claimedStudents = selections.filter(s => s.sponsorId !== null).length;
    const unclaimedStudents = totalStudents - claimedStudents;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Eye className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fon Genel Durumu</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {fund.title} için tüm öğrenci ve sponsor (destekçi) dağılımları
                        </p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/funds/${fund.id}/payment`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Kendi Taksitlerim / Öde
                </Link>
            </div>

            {/* Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Öğrenci</div>
                    <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalStudents} Kişi</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Üstlenilen (Sponsoru Belli)</div>
                    <div className="text-3xl font-bold mt-1 text-green-600 dark:text-green-500">{claimedStudents} Kişi</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Boşta Kalan (Sahipsiz)</div>
                    <div className="text-3xl font-bold mt-1 text-orange-500 dark:text-orange-400">{unclaimedStudents} Kişi</div>
                    {unclaimedStudents > 0 && (
                        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-orange-100 to-transparent dark:from-orange-900/20" />
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4 md:p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Bursiyer - Sponsor Dağılımı</h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {selections.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Henüz bu fona bursiyer seçimi yapılmamış.
                        </div>
                    ) : (
                        selections.map((sel) => (
                            <div key={sel.id} className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {sel.application?.user?.fullName || `Bursiyer ${sel.applicationId.substring(0, 4)}`}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Aylık {sel.amount} ₺ • Fona Eklenme: {format(sel.createdAt, "d MMM yyyy", { locale: tr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex items-center gap-3">
                                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 hidden md:block" />
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                        sel.sponsorId 
                                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300' 
                                            : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-300'
                                    }`}>
                                        <Wallet className="w-4 h-4" />
                                        <span className="text-sm font-bold">
                                            {sel.sponsorId ? (
                                                sel.sponsor?.fullName || "Bilinmeyen Sponsor"
                                            ) : (
                                                "Henüz Üstlenilmedi (Boşta)"
                                            )}
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
