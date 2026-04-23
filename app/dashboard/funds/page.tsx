import { getSponsorFunds } from "@/lib/actions/sponsor";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, Wallet, Users, CreditCard, Plus, UserPlus, Calendar } from "lucide-react";
import { format, differenceInMonths } from "date-fns";
import { tr } from "date-fns/locale";

export default async function SponsorFundsPage() {
    const funds = await getSponsorFunds();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fonlarım ve Desteklerim</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Sponsor olduğunuz veya maddi olarak katkıda bulunduğunuz tüm eğitim fonları.
                    </p>
                </div>
                <Link
                    href="/dashboard/funds/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Yeni Fon Oluştur
                </Link>
            </div>

            {funds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Henüz Fonunuz Yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        Bursiyerlere destek olmak için Vakıf veya Derneğiniz üzerinden bir fon oluşturabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funds.map((fund) => (
                        <div key={fund.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col h-full relative">

                            {!fund.isActive && (
                                <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                                    Kapalı
                                </div>
                            )}

                            {/* Fund Photo Header */}
                            <div style={{ height: "160px", minHeight: "160px", width: "100%", backgroundColor: "#f3f4f6" }} className="relative overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-zinc-800">
                                {fund.photoUrl ? (
                                    <img
                                        src={fund.photoUrl.trim()}
                                        alt={fund.title}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                    />
                                ) : (
                                    <div className="text-gray-400 dark:text-zinc-600 flex flex-col items-center">
                                        <Wallet className="h-12 w-12 mb-2 opacity-50" />
                                        <span className="text-xs uppercase tracking-widest font-semibold">Görsel Yok</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2">{fund.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                    {fund.description || "Bu fon hakkında herhangi bir açıklama bulunmuyor."}
                                </p>

                                {(() => {
                                    const parsedDuration = fund.durationMonths || (fund.startDate && fund.endDate ? Math.round(differenceInMonths(new Date(fund.endDate), new Date(fund.startDate))) : null);
                                    const parsedCapacity = fund.targetStudentCount || 1;

                                    return (
                                        <div className="grid grid-cols-2 gap-4 mt-auto">
                                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-gray-100 dark:border-zinc-800">
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Dönemi</div>
                                                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{fund.period || "Belirtilmemiş"}</div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-gray-100 dark:border-zinc-800">
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Aylık Tutar</div>
                                                <div className="font-bold text-blue-600 dark:text-blue-400 text-sm truncate">{fund.monthlyLimit ? `${fund.monthlyLimit} ₺` : "Serbest"}</div>
                                            </div>

                                            {(fund.startDate || fund.endDate) && (
                                                <div className="col-span-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100/50 dark:border-blue-900/30 flex flex-col gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-70" />
                                                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                            {fund.startDate ? format(new Date(fund.startDate), "d MMMM yyyy", { locale: tr }) : "Bilinmiyor"}
                                                            <span className="mx-2 text-blue-400/50">-</span>
                                                            {fund.endDate ? format(new Date(fund.endDate), "d MMMM yyyy", { locale: tr }) : "Süresiz"}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {parsedCapacity > 0 && (
                                                            <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 w-fit">
                                                                <Users className="w-3.5 h-3.5" /> {parsedCapacity} Öğrenci Kapasitesi
                                                            </div>
                                                        )}
                                                        {parsedDuration && (
                                                            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap w-fit">
                                                                {parsedDuration} Ay Süre
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
                                <Link
                                    href={`/dashboard/funds/${fund.id}/payment`}
                                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Ödeme detaylarını ve taksitleri görüntüle"
                                >
                                    <CreditCard className="w-4 h-4 mr-1.5" />
                                    Ödeme Detaylarını Gör
                                </Link>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/funds/${fund.id}/students`}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                        title="Bursiyerlerim / Seçilen Öğrenciler"
                                    >
                                        <Users className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={`/dashboard/funds/${fund.id}`}
                                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
                                        title="Kişileri/Katılımcıları Yönet ve Davet Et"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
