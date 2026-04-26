import { db } from "@/lib/db";
import { fundInvitations, users, references } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Wallet, CheckCircle, Clock, XCircle } from "lucide-react";
import Image from "next/image";
import { InvitationActions } from "./invitation-actions";

export default async function PendingInvitationsPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!currentUser) redirect("/login");

    const invitations = await db.query.fundInvitations.findMany({
        where: or(
            eq(fundInvitations.inviteeId, currentUser.id),
            eq(fundInvitations.inviteeEmail, currentUser.email || "")
        ),
        with: {
            fund: {
                with: { contributors: true }
            },
            inviter: true
        },
        orderBy: (invitations, { desc }) => [desc(invitations.createdAt)]
    });

    const refInvitations = currentUser.email ? await db.query.references.findMany({
        where: eq(references.email, currentUser.email),
        with: {
            application: {
                with: { form: true, user: true }
            }
        },
        orderBy: (references, { desc }) => [desc(references.createdAt)]
    }) : [];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Onayımda Bekleyenler</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Fon davetiyeleri ve öğrenci referans istekleri tek bir ekranda.
                    </p>
                </div>
            </div>

            {/* Referans Davetiyeleri */}
            {refInvitations.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Bekleyen Öğrenci Referans Onayları
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {refInvitations.map((ref: any) => (
                            <div key={ref.id} className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 hover:shadow-lg transition-all flex flex-col relative overflow-hidden">
                                {ref.status === 'pending' && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[100px] -z-0"></div>}

                                <div className="flex justify-between items-start mb-3 z-10">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${ref.status === 'pending' ? 'bg-amber-100 text-amber-800' : ref.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {ref.status === 'pending' ? 'Cevap Bekliyor' : ref.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                    </span>
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                        {ref.title === 'muhtar' ? 'Mahalle Muhtarı Onayı' : 'Akademisyen Onayı'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 break-all mb-1">
                                    Oğrenci: {ref.application?.user?.fullName || "Bilinmiyor"}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    Form: {ref.application?.form?.title}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <Link href={`/dashboard/invitations/reference/${ref.id}`} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                                        <CheckCircle className="w-4 h-4" /> İncele & Onay Mektubu
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fon Katılımcısı Davetiyeleri */}
            {invitations.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-500" />
                        Fon Katılımcısı İstekleri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col h-full relative">
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    {inv.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md font-medium">Bekliyor</span>}
                                    {inv.status === 'accepted' && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Kabul Edildi</span>}
                                    {inv.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Reddedildi</span>}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex gap-4 items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                                            {inv.fund?.title?.charAt(0) || 'F'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">{inv.fund?.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{inv.fund?.description}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-950/50 p-3 rounded-lg mb-4 text-sm flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                                            <Image src="/logo.png" alt="User" width={20} height={20} className="rounded-full opacity-50 grayscale" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{inv.inviter?.fullName}</p>
                                            <p className="text-gray-500 text-xs">Sizi bu fona davet etti</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Fon Rolü: <strong className="text-gray-900 dark:text-gray-100">{inv.role === 'bursiyer' ? 'Öğrenci' : 'Sponsor Destekçi'}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const fund = inv.fund;
                                    const targetCount = fund.targetStudentCount || 1;
                                    const currentTotal = (fund.contributors as any[])?.filter(c => c.isActive).reduce((sum, c) => sum + (c.studentCount || 1), 0) || 0;

                                    return (
                                        <>
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-4 py-2 border-y border-blue-100 dark:border-blue-900/30 text-sm flex justify-between items-center">
                                                <span className="font-medium text-blue-700 dark:text-blue-300">Doluluk Oranı:</span>
                                                <span className="font-bold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800/40 px-2 py-0.5 rounded">
                                                    Kabul Gören: {currentTotal} / {targetCount}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50">
                                                <InvitationActions
                                                    invitationId={inv.id}
                                                    fundId={fund.id}
                                                    fund={fund}
                                                    currentTotal={currentTotal}
                                                    targetCount={targetCount}
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {invitations.length === 0 && refInvitations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-center">
                    <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full text-gray-400 mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Şu an bekleyen hiçbir davetiyeniz yok</h2>
                    <p className="text-gray-500 max-w-sm mt-2"> Bekleyen referans onayınız veya ortaklık fon davetiniz bulunmuyor. </p>
                </div>
            )}
        </div>
    );
}
