import { db } from "@/lib/db";
import { funds, fundSelections, fundContributors } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { Calendar, Users, Eye, Wallet, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { tr } from "date-fns/locale";
import { format } from "date-fns";
import { ShareFundButton } from "@/components/share-fund-button";

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
    
    const totalStudents = fund.targetStudentCount || 0;
    
    const contributors = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fundId),
        with: { user: true }
    });
    
    // Üstlenilen kişi sadece Daimi (recurring) destekçilerden hesaplanır.
    const claimedStudents = contributors
        .filter(c => c.supporterType === 'recurring')
        .reduce((sum, c) => sum + (c.studentCount || 1), 0);
        
    const unclaimedStudents = Math.max(0, totalStudents - claimedStudents);

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
                <div className="flex items-center gap-3">
                    <ShareFundButton fund={{...fund, ownerName: fund.owner?.fullName || ''}} variant="outline" className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-semibold shadow-sm" />
                    <Link
                        href={`/dashboard/funds/${fund.id}/payment`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {fund.paymentMethod === 'wire_transfer' ? 'Gelen Ödemeler' : 'Kendi Taksitlerim / Öde'}
                    </Link>
                </div>
            </div>

            {/* Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Öğrenci Hedefi</div>
                    <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalStudents} Kişi</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Üstlenilen (Daimi Sponsor)</div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sol Taraf: Bursiyer - Sponsor Eşleşmeleri */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <div className="p-4 md:p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Bursiyer - Sponsor Eşleşmesi</h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-zinc-800 flex-1">
                        {selections.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Henüz bu fona bursiyer seçimi (ataması) yapılmamış.
                            </div>
                        ) : (
                            selections.map((sel) => (
                                <div key={sel.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {sel.application?.user?.fullName || `Bursiyer ${sel.applicationId.substring(0, 4)}`}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {format(sel.createdAt, "d MMM yyyy", { locale: tr })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {sel.amount} ₺ / Ay
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm ${
                                        sel.sponsorId 
                                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300' 
                                            : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-300'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4" />
                                            <span className="font-medium">Sponsor:</span>
                                        </div>
                                        <span className="font-bold text-right">
                                            {sel.sponsorId ? (
                                                sel.sponsor?.fullName || "Bilinmeyen Sponsor"
                                            ) : (
                                                "Henüz Üstlenilmedi"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sağ Taraf: Fon Destekçileri (Daimi & Tekil) */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <div className="p-4 md:p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Tüm Destekçiler (Bağışçılar)</h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-zinc-800 flex-1">
                        {contributors.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Bu fon için henüz destekçi (katılımcı) bulunmuyor.
                            </div>
                        ) : (
                            contributors.map((c) => (
                                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {c.user?.fullName || "Bilinmeyen Kişi"}
                                        </h4>
                                        <div className="mt-1">
                                            {c.supporterType === 'recurring' ? (
                                                <span className="bg-fbiad-dark-blue/10 text-fbiad-dark-blue dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-fbiad-dark-blue/20">
                                                    DAİMİ DESTEKÇİ ({c.studentCount} Kişi)
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 dark:border-zinc-700">
                                                    TEK SEFERLİK (Serbest)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Fonladığı Tutar</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{c.amount.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
