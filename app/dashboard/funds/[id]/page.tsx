import { db } from "@/lib/db";
import { funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Wallet, ShieldCheck, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { InviteDialog } from "./invite-dialog";
import { getCurrentTenant } from "@/lib/data/tenant";

export default async function FundDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tenantData = await getCurrentTenant();

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, id),
        with: {
            owner: true,
            contributors: {
                with: { user: true }
            },
            invitations: true
        }
    });

    if (!fund) notFound();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <Link href="/dashboard/funds" className="inline-flex items-center text-sm font-medium px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors shadow-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Fonlara Dön
                </Link>
                {tenantData?.userId === fund.ownerId && <InviteDialog fundId={fund.id} />}
            </div>

            {/* Fund Meta Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {fund.photoUrl && (
                    <div style={{ height: "192px", minHeight: "192px", width: "100%", position: "relative", backgroundColor: "#f3f4f6" }} className="overflow-hidden">
                        <img src={fund.photoUrl.trim()} alt={fund.title} style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
                    </div>
                )}
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{fund.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">{fund.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Dönem</span>
                            <span className="font-semibold text-sm">{fund.period || "-"}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Aylık Kota</span>
                            <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{fund.monthlyLimit ? `${fund.monthlyLimit} ₺` : "Serbest"}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Başlangıç</span>
                            <span className="font-medium text-sm">{fund.startDate ? new Date(fund.startDate).toLocaleDateString("tr-TR") : "-"}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Bitiş</span>
                            <span className="font-medium text-sm">{fund.endDate ? new Date(fund.endDate).toLocaleDateString("tr-TR") : "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants Grid */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fon Katılımcıları ve Davetliler</h2>
                    <div className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        Toplam: {1 + fund.contributors.length + fund.invitations.length} Kişi
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sponsor / Creator Card */}
                    <div className="p-5 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-900/30 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-inner">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{fund.owner.fullName}</h3>
                                <p className="text-xs text-gray-500 truncate">{fund.owner.email}</p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase text-white rounded-bl-xl">
                            Kurucu
                        </div>
                    </div>

                    {/* Active Contributors Cards */}
                    {fund.contributors.map((c) => (
                        <div key={c.id} className="p-5 flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm relative overflow-hidden group hover:border-green-300 dark:hover:border-green-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 p-3 rounded-xl">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{c.user.fullName}</h3>
                                    <p className="text-xs text-gray-500 truncate">{c.user.email}</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900 px-3 py-1 text-[10px] font-bold uppercase text-green-700 dark:text-green-300 rounded-bl-xl">
                                Bursveren
                            </div>
                        </div>
                    ))}

                    {/* Pending/Status Invitations Cards */}
                    {fund.invitations.filter((i) => i.status !== 'accepted').map((inv) => {
                        const isPending = inv.status === 'pending';
                        const isAccepted = inv.status === 'accepted'; // will never hit since filtered, but kept for clarity
                        const isRejected = inv.status === 'rejected';

                        return (
                            <div key={inv.id} className={`p-5 flex flex-col justify-between border rounded-2xl shadow-sm relative overflow-hidden transition-colors ${isPending ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/50' :
                                isAccepted ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700/50' :
                                    'bg-gray-50 dark:bg-zinc-900/40 border-red-200 dark:border-red-900/30'
                                }`}>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`p-3 rounded-xl ${isPending ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-600' :
                                        isAccepted ? 'bg-green-100 dark:bg-green-800/40 text-green-700' :
                                            'bg-red-50 dark:bg-red-900/20 text-red-500'
                                        }`}>
                                        {isPending ? <Mail className="w-6 h-6 outline-dashed outline-2 outline-offset-2 outline-amber-300" /> :
                                            isAccepted ? <CheckCircle2 className="w-6 h-6" /> :
                                                <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="w-full min-w-0">
                                        <h3 className={`font-bold text-base line-clamp-1 ${isRejected ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{inv.inviteeName}</h3>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{inv.inviteeEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/50 dark:border-zinc-800/60">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                        Platform Daveti
                                    </span>
                                    <span className={`text-[10px] font-bold flex items-center px-2 py-0.5 rounded-full ${isPending ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100' :
                                        isAccepted ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                        }`}>
                                        {isPending && <Clock className="w-3 h-3 mr-1" />}
                                        {isPending ? 'Bekliyor' : isAccepted ? 'Kabul Edildi' : 'Reddedildi'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {fund.contributors.length === 0 && fund.invitations.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-dashed rounded-2xl border-gray-200 dark:border-zinc-800">
                        <User className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Henüz Kimse Yok</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">Bu fona sağ üstten yeni kişiler davet ederek fon hareketlerini veya başvuru akışlarını başlatabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
