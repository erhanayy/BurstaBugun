"use client";

import { useState } from "react";
import { addMultipleStudentPaymentLogs } from "@/lib/actions/student-payments";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function UpcomingTable({
    upcoming
}: {
    upcoming: { id: string, fundTitle: string, fundId: string, studentName: string, amount: number, month: number, year: number, dateString: string, applicationId: string }[]
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [sortField, setSortField] = useState<string>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const toggleAll = () => {
        if (selectedIds.length === sortedUpcoming.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedUpcoming.map(u => u.id));
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

    const sortedUpcoming = [...upcoming].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (sortField === "date") {
            aVal = a.year * 100 + a.month;
            bVal = b.year * 100 + b.month;
        } else if (sortField === "fundTitle") {
            aVal = a.fundTitle.toLowerCase();
            bVal = b.fundTitle.toLowerCase();
        } else if (sortField === "studentName") {
            aVal = a.studentName.toLowerCase();
            bVal = b.studentName.toLowerCase();
        } else if (sortField === "amount") {
            aVal = a.amount;
            bVal = b.amount;
        } else {
            return 0;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const handleMarkAsPaid = async () => {
        if (selectedIds.length === 0) return;
        setIsSaving(true);
        try {
            const payloads = selectedIds.map(id => {
                const u = upcoming.find(x => x.id === id)!;
                return {
                    applicationId: u.applicationId,
                    fundId: u.fundId,
                    amount: u.amount,
                    paymentDateStr: new Date(u.year, u.month - 1, 1).toISOString()
                };
            });

            const res = await addMultipleStudentPaymentLogs(payloads);
            if (res.success) {
                toast.success(`${res.successCount} adet ödeme başarıyla "Tamamlandı" olarak işaretlendi ve geçmişe aktarıldı.${res.failCount > 0 ? ` ${res.failCount} adet hata oluştu.` : ''}`);
                setSelectedIds([]);
            } else {
                toast.error("Ödeme işlenirken bir hata oluştu.");
            }
        } catch (e: any) {
            toast.error(e.message || "Ödeme işlenirken bir hata oluştu.");
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
                <span>Toplam <strong>{upcoming.length}</strong> adet beklenen ödeme kaydı bulundu.</span>
                <span>Toplam Beklenen Tutar: <strong>{upcoming.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('tr-TR')} ₺</strong></span>
            </div>
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
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 select-none">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={sortedUpcoming.length > 0 && selectedIds.length === sortedUpcoming.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th 
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("date")}
                            >
                                Hedef Tarih {renderSortIcon("date")}
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
                                className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => handleSort("amount")}
                            >
                                Beklenen Tutar {renderSortIcon("amount")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {sortedUpcoming.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Seçili dönem için yaklaşan bir ödeme planı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            sortedUpcoming.map((plan) => (
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
