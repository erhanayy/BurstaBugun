'use client'

import { useState } from "react";
import { approveWireTransfer, rejectWireTransfer } from "@/lib/actions/wire-transfers";
import { CheckCircle, XCircle, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function WireTransferList({ payments }: { payments: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        if (!confirm("Bu havale ödemesini onaylamak istediğinize emin misiniz?")) return;
        setLoadingId(id);
        const res = await approveWireTransfer(id);
        if (res.success) {
            toast.success("Ödeme onaylandı!");
        } else {
            toast.error(res.error || "Hata oluştu");
        }
        setLoadingId(null);
    };

    const handleReject = async (id: string) => {
        if (!confirm("Bu ödemeyi reddetmek istediğinize emin misiniz?")) return;
        setLoadingId(id);
        const res = await rejectWireTransfer(id);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payments.map(payment => (
                <div key={payment.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                    <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{payment.fund?.title || "Bilinmeyen Fon"}</h3>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">Bekliyor</span>
                        </div>
                        
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                            {payment.amount?.toLocaleString('tr-TR')} ₺
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold w-24">Öğrenci:</span>
                                <span className="truncate">{payment.application?.user?.name || payment.application?.user?.email || "Bilinmiyor"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold w-24">Tarih:</span>
                                <span>{new Date(payment.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>

                        {payment.receiptUrl && (
                            <a 
                                href={payment.receiptUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors border border-gray-200 dark:border-zinc-700"
                            >
                                <ExternalLink size={18} /> Dekontu Görüntüle
                            </a>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
                        <button 
                            onClick={() => handleReject(payment.id)}
                            disabled={loadingId === payment.id}
                            className="flex-1 py-2.5 flex justify-center items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <XCircle size={18} /> Reddet
                        </button>
                        <button 
                            onClick={() => handleApprove(payment.id)}
                            disabled={loadingId === payment.id}
                            className="flex-1 py-2.5 flex justify-center items-center gap-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {loadingId === payment.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            Onayla
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
