'use client'

import { useState } from "react";
import { approveWireTransfer, rejectWireTransfer } from "@/lib/actions/wire-transfers";
import { CheckCircle, XCircle, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function WireTransferList({ payments }: { payments: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleApprove = async (paymentIds: string[]) => {
        if (!confirm("Bu havale ödemesini onaylamak istediğinize emin misiniz?")) return;
        setLoadingId(paymentIds[0]);
        const res = await approveWireTransfer(paymentIds);
        if (res.success) {
            toast.success("Ödeme onaylandı!");
        } else {
            toast.error(res.error || "Hata oluştu");
        }
        setLoadingId(null);
    };

    const handleReject = async (paymentIds: string[]) => {
        if (!confirm("Bu ödemeyi reddetmek istediğinize emin misiniz?")) return;
        setLoadingId(paymentIds[0]);
        const res = await rejectWireTransfer(paymentIds);
        if (res.success) {
            toast.success("Ödeme reddedildi!");
        } else {
            toast.error(res.error || "Hata oluştu");
        }
        setLoadingId(null);
    };

    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Onay Bekleyen Havale Yok</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Şu anda sistemde onaya düşmüş yeni bir Havale/EFT dekontu bulunmuyor.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800">Tarih</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800">Öğrenci / Gönderen</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800">Fon Adı</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800 text-right">Tutar</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800 text-center">Dekont</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-zinc-800 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {payment.application?.user?.name || payment.application?.user?.email || "Bilinmiyor"}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {payment.fund?.title || "Bilinmeyen Fon"}
                                    {payment.paymentIds.length > 1 && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            Tüm Dönem ({payment.paymentIds.length} Taksit)
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold text-fbiad-dark-blue dark:text-fbiad-blue text-right">
                                    {payment.totalAmount?.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {payment.receiptUrl ? (
                                        <a 
                                            href={payment.receiptUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                        >
                                            <ExternalLink size={16} /> Görüntüle
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleReject(payment.paymentIds)}
                                            disabled={loadingId === payment.paymentIds[0]}
                                            className="px-3 py-1.5 flex items-center gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50 border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                                        >
                                            <XCircle size={16} /> Reddet
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(payment.paymentIds)}
                                            disabled={loadingId === payment.paymentIds[0]}
                                            className="px-3 py-1.5 flex items-center gap-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                                        >
                                            {loadingId === payment.paymentIds[0] ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                            Onayla
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
