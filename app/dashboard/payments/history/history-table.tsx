"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, Loader2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cancelMultipleStudentPaymentLogs } from "@/lib/actions/student-payments";
import { toast } from "sonner";

export default function HistoryTable({
    history
}: {
    history: any[]
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [sortField, setSortField] = useState<string>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const toggleAll = () => {
        if (selectedIds.length === sortedHistory.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedHistory.map(p => p.id));
        }
    };

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(s => s !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedHistory = [...history].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (sortField === "date") {
            aVal = new Date(a.paymentDate || a.createdAt).getTime();
            bVal = new Date(b.paymentDate || b.createdAt).getTime();
        } else if (sortField === "fundTitle") {
            aVal = (a.fund?.title || "").toLowerCase();
            bVal = (b.fund?.title || "").toLowerCase();
        } else if (sortField === "studentName") {
            aVal = (a.application?.user?.fullName || "").toLowerCase();
            bVal = (b.application?.user?.fullName || "").toLowerCase();
        } else if (sortField === "amount") {
            aVal = a.amount || 0;
            bVal = b.amount || 0;
        } else {
            return 0;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const handleRemovePayments = async () => {
        if (selectedIds.length === 0) return;

        if (!window.confirm(`Seçilen ${selectedIds.length} adet ödemenin iptal edilip tekrar "Bekliyor" statüsüne alınmasını onaylıyor musunuz?`)) {
            return;
        }

        setIsSaving(true);
        try {
            const res = await cancelMultipleStudentPaymentLogs(selectedIds);
            if (res.success) {
                toast.success(`${res.successCount} adet ödeme başarıyla iptal edildi ve "Bekliyor" ekranına geri gönderildi.${res.failCount > 0 ? ` ${res.failCount} adet hata oluştu.` : ''}`);
                setSelectedIds([]);
            } else {
                toast.error("İşlem sırasında bir hata oluştu.");
            }
        } catch (e: any) {
            toast.error(e.message || "İşlem sırasında bir hata oluştu.");
        }
        setIsSaving(false);
    };

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 opacity-40 hover:opacity-100" />;
        return sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 inline ml-1 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 inline ml-1 text-blue-600" />;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                <span>Toplam <strong>{history.length}</strong> adet geçmiş ödeme kaydı bulundu.</span>
                <span>Toplam Ödenen Tutar: <strong>{history.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('tr-TR')} ₺</strong></span>
            </div>
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
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 select-none">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    checked={sortedHistory.length > 0 && selectedIds.length === sortedHistory.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th 
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("date")}
                            >
                                Ödeme Tarihi {renderSortIcon("date")}
                            </th>
                            <th 
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("fundTitle")}
                            >
                                Fon Adı {renderSortIcon("fundTitle")}
                            </th>
                            <th 
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("studentName")}
                            >
                                Bursiyer {renderSortIcon("studentName")}
                            </th>
                            <th 
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("amount")}
                            >
                                Tutar {renderSortIcon("amount")}
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {sortedHistory.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Kriterlere uygun geçmiş ödeme bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            sortedHistory.map((payment) => (
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
                                        <span className="inline-flex items-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mr-1" /> Tamamlandı</span>
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
