"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, AlertCircle, Clock, Loader2, XCircle } from "lucide-react";
import { removePayments } from "@/lib/actions/payments";
import { toast } from "sonner";

export default function HistoryTable({
    history
}: {
    history: any[]
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const toggleAll = () => {
        if (selectedIds.length === history.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(history.map(p => p.id));
        }
    };

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(s => s !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleRemovePayments = async () => {
        if (selectedIds.length === 0) return;

        if (!window.confirm(`Seçilen ${selectedIds.length} adet ödemenin iptal edilip tekrar "Bekliyor" statüsüne alınmasını onaylıyor musunuz?`)) {
            return;
        }

        setIsSaving(true);
        try {
            await removePayments(selectedIds);
            toast.success(`${selectedIds.length} adet ödeme başarıyla iptal edildi ve "Bekliyor" ekranına geri gönderildi.`);
            setSelectedIds([]);
        } catch (e: any) {
            toast.error(e.message || "İşlem sırasında bir hata oluştu.");
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {selectedIds.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center">
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        {selectedIds.length} ödeme kaydı seçildi.
                    </span>
                    <button
                        onClick={handleRemovePayments}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Ödemeyi Geri Al (İptal Et)
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    checked={history.length > 0 && selectedIds.length === history.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Ödeme Tarihi</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Fon Adı</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Bursiyer</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Tutar</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Kriterlere uygun geçmiş ödeme bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            history.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            checked={selectedIds.includes(payment.id)}
                                            onChange={() => toggleOne(payment.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {format(new Date(payment.paymentDate || payment.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                            {payment.fund?.title || "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {payment.application?.user?.fullName || "-"}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        {payment.amount.toLocaleString('tr-TR')} ₺
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end">
                                        {payment.status === 'completed' ? (
                                            <span className="inline-flex items-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mr-1" /> Tamamlandı</span>
                                        ) : payment.status === 'failed' ? (
                                            <span className="inline-flex items-center text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> Başarısız</span>
                                        ) : (
                                            <span className="inline-flex items-center text-amber-600"><Clock className="w-4 h-4 mr-1" /> Bekliyor</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
