"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { respondToInvitation } from "@/lib/actions/invitations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function InvitationActions({ invitationId, fundId, fund, currentTotal, targetCount }: { invitationId: string, fundId: string, fund?: any, currentTotal?: number, targetCount?: number }) {
    const [isPending, startTransition] = useTransition();
    const [studentCount, setStudentCount] = useState<number | "">(1);
    const router = useRouter();

    const fundMonthlyLimit = fund?.monthlyLimit || 0;
    const fundDuration = fund?.durationMonths || 1;
    const paymentMethod = fund?.paymentMethod || 'monthly';
    const activeStudentCount = typeof studentCount === "number" && studentCount > 0 ? studentCount : 1;
    const totalCost = fundMonthlyLimit * fundDuration * activeStudentCount;

    const handleResponse = (status: "accepted" | "rejected") => {
        if (status === "accepted" && (typeof studentCount !== "number" || studentCount < 1)) {
            toast.error("Öğrenci sayısı en az 1 olmalıdır.");
            return;
        }

        startTransition(async () => {
            try {
                const finalCount = typeof studentCount === "number" && studentCount > 0 ? studentCount : 1;
                const res = await respondToInvitation(invitationId, status, finalCount);
                if (res.success) {
                    toast.success(`Davet başarıyla ${status === "accepted" ? "kabul edildi" : "reddedildi"}.`);
                    if (status === "accepted") {
                        router.push(`/dashboard/funds/${fundId}/payment`);
                    }
                }
            } catch (error: any) {
                toast.error(error.message || "İşlem gerçekleştirilemedi.");
            }
        });
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Kaç Öğrenci Alacaksınız?
                    </label>
                    <Input
                        type="number"
                        min={1}
                        value={studentCount}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                setStudentCount("");
                            } else {
                                setStudentCount(parseInt(val));
                            }
                        }}
                        className="h-9"
                    />

                    <div className="mt-2 p-2.5 bg-blue-50 dark:bg-zinc-800/80 rounded-md border border-blue-100 dark:border-zinc-700">
                        <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            {activeStudentCount} Öğrenci İçin Toplam Bedel (Simülasyon)
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {paymentMethod === 'upfront' ? (
                                <span>
                                    Ödeme Şekli <strong>Tek Sefer</strong> olduğundan, kredi kartınızdan onay sonrası tek çekimde <strong>{totalCost.toLocaleString('tr-TR')} ₺</strong> tahsil edilecektir.
                                </span>
                            ) : (
                                <span>
                                    {activeStudentCount} Öğrenci x {fundMonthlyLimit.toLocaleString('tr-TR')} ₺ x {fundDuration} Ay = <strong>Toplam {totalCost.toLocaleString('tr-TR')} ₺ Taahhüt</strong> (Aylık Kesilecektir)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 w-full">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                            <Info className="w-4 h-4" />
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Fon Detayları</DialogTitle>
                            <DialogDescription>
                                Bu fona ait genel bilgiler aşağıdadır. Planda herhangi bir değişiklik yapmadan salt okunur olarak görüntülemektesiniz.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <strong className="block text-sm text-gray-500">Fon Adı</strong>
                                <span>{fund?.title}</span>
                            </div>
                            <div>
                                <strong className="block text-sm text-gray-500">Fon Amacı ve Detayları</strong>
                                <span>{fund?.description || "-"}</span>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <strong className="block text-sm text-gray-500">Öğrenci Kapasitesi</strong>
                                    <span>{targetCount} Öğrenci</span>
                                </div>
                                <div>
                                    <strong className="block text-sm text-gray-500">Aylık Tutar</strong>
                                    <span>{fund?.monthlyLimit ? `${fund.monthlyLimit.toLocaleString('tr-TR')} ₺` : "Belirtilmemiş"}</span>
                                </div>
                                <div>
                                    <strong className="block text-sm text-gray-500">Fon Süresi</strong>
                                    <span>{fundDuration} Ay</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                                <strong className="block text-sm text-gray-500">Ödeme Şekli</strong>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {paymentMethod === 'upfront' ? 'Kredi Kartı ile Tek Seferde Peşin (Tüm Dönem)' : 'Aylık Kredi Kartı Provizyonu (Taksit Taksit)'}
                                </span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <button
                    onClick={() => handleResponse("accepted")}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Kabul Et
                </button>
                <button
                    onClick={() => handleResponse("rejected")}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Reddet
                </button>
            </div>
        </div>
    );
}
