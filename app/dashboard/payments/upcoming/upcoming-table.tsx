"use client";

import { useState } from "react";
import { markAsPaid } from "@/lib/actions/payments";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Link as LinkIcon, Download } from "lucide-react";

export default function UpcomingTable({
    upcoming
}: {
    upcoming: { id: string, fundTitle: string, fundId: string, studentName: string, amount: number, month: number, year: number, dateString: string, applicationId: string }[]
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const toggleAll = () => {
        if (selectedIds.length === upcoming.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(upcoming.map(u => u.id));
        }
    };

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(s => s !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleMarkAsPaid = async () => {
        if (selectedIds.length === 0) return;
        setIsSaving(true);
        try {
            await markAsPaid(selectedIds);
            toast.success(`${selectedIds.length} adet ödeme başarıyla "Tamamlandı" olarak işaretlendi ve geçmişe aktarıldı.`);
            setSelectedIds([]);
        } catch (e: any) {
            toast.error(e.message || "Ödeme işlenirken bir hata oluştu.");
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        {selectedIds.length} kayıt seçildi.
                    </span>
                    <button
                        onClick={handleMarkAsPaid}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Seçilenleri Ödendi İşaretle
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
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={upcoming.length > 0 && selectedIds.length === upcoming.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Hedef Tarih</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Fon Adı</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Bursiyer</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Beklenen Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {upcoming.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Seçili dönem için yaklaşan bir ödeme planı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            upcoming.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(plan.id)}
                                            onChange={() => toggleOne(plan.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                        {plan.dateString}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                            {plan.fundTitle}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {plan.studentName}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 text-right">
                                        {plan.amount.toLocaleString('tr-TR')} ₺
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
