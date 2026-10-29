"use client";

import { useState, useTransition } from "react";
import { 
    ArrowUpRight, ArrowDownRight, Search, Edit2, Trash2, 
    Calendar, Landmark, FileText, Filter, AlertCircle, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { deleteBudgetTransaction } from "@/lib/actions/budget";
import { getCategoryLabel } from "./budget-transaction-dialog";
import { toast } from "sonner";

interface TransactionItem {
    id: string;
    type: 'income' | 'expense';
    category: string;
    title: string;
    counterparty: string | null;
    amount: number;
    transactionDate: Date | string;
    documentNo: string | null;
    notes: string | null;
    bankAccount?: { id: string; bankName: string; accountName: string } | null;
    creator?: { id: string; fullName: string | null; email: string | null } | null;
}

interface BudgetTransactionsTableProps {
    transactions: TransactionItem[];
    onEdit: (transaction: TransactionItem) => void;
    onRefresh: () => void;
}

export function BudgetTransactionsTable({
    transactions,
    onEdit,
    onRefresh,
}: BudgetTransactionsTableProps) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!deleteId) return;
        startTransition(async () => {
            const res = await deleteBudgetTransaction(deleteId);
            if (res.success) {
                toast.success("İşlem silindi.");
                setDeleteId(null);
                onRefresh();
            } else {
                toast.error(res.error || "İşlem silinemedi.");
            }
        });
    };

    const filtered = transactions.filter(t => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.title.toLowerCase().includes(q) ||
            (t.counterparty && t.counterparty.toLowerCase().includes(q)) ||
            (t.documentNo && t.documentNo.toLowerCase().includes(q)) ||
            (t.notes && t.notes.toLowerCase().includes(q)) ||
            getCategoryLabel(t.category, t.type).toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Başlık, firma, dekont no veya kategori ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-xs h-9"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
                        <button
                            type="button"
                            onClick={() => setTypeFilter("all")}
                            className={`px-3 py-1 rounded-md transition-all font-medium ${
                                typeFilter === "all"
                                    ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Tümü ({transactions.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter("income")}
                            className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                                typeFilter === "income"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <ArrowUpRight className="w-3 h-3" />
                            Gelirler
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter("expense")}
                            className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                                typeFilter === "expense"
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            <ArrowDownRight className="w-3 h-3" />
                            Giderler
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800 font-semibold">
                        <tr>
                            <th className="py-3 px-3.5 w-24">Tarih</th>
                            <th className="py-3 px-3 w-24">Tür</th>
                            <th className="py-3 px-3">Kategori</th>
                            <th className="py-3 px-3">İşlem / Başlık</th>
                            <th className="py-3 px-3">İlgili Kurum / Kişi</th>
                            <th className="py-3 px-3">Hesap / Kasa</th>
                            <th className="py-3 px-3 text-right">Tutar</th>
                            <th className="py-3 px-3.5 w-20 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                    <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
                                    <p className="font-medium text-xs">Kayıtlı işlem bulunamadı.</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((t) => {
                                const isIncome = t.type === 'income';
                                const dStr = new Date(t.transactionDate).toLocaleDateString('tr-TR');

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="py-3 px-3.5 text-gray-500 font-mono text-[11px]">
                                            {dStr}
                                        </td>
                                        <td className="py-3 px-3">
                                            {isIncome ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1 text-[11px]">
                                                    <ArrowUpRight className="w-3 h-3" /> Gelir
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 gap-1 text-[11px]">
                                                    <ArrowDownRight className="w-3 h-3" /> Gider
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300 font-medium">
                                            {getCategoryLabel(t.category, t.type)}
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                                            <div>{t.title}</div>
                                            {t.documentNo && (
                                                <div className="text-[10px] text-gray-400 font-mono">Belge: {t.documentNo}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                                            {t.counterparty || "-"}
                                        </td>
                                        <td className="py-3 px-3 text-gray-500 text-[11px]">
                                            {t.bankAccount ? `${t.bankAccount.bankName} (${t.bankAccount.accountName})` : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                                            <span className={isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                                {isIncome ? "+" : "-"}{(t.amount || 0).toLocaleString('tr-TR')} ₺
                                            </span>
                                        </td>
                                        <td className="py-3 px-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(t)}
                                                    className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(t.id)}
                                                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
                {filtered.length === 0 ? (
                    <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs text-gray-500">
                        Kayıtlı işlem bulunamadı.
                    </div>
                ) : (
                    filtered.map((t) => {
                        const isIncome = t.type === 'income';
                        const dStr = new Date(t.transactionDate).toLocaleDateString('tr-TR');

                        return (
                            <div 
                                key={t.id}
                                className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-2 text-xs"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Badge className={isIncome ? "bg-emerald-50 text-emerald-700 text-[10px]" : "bg-red-50 text-red-700 text-[10px]"}>
                                                {isIncome ? "+ Gelir" : "- Gider"}
                                            </Badge>
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                {getCategoryLabel(t.category, t.type)}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white pt-1">{t.title}</h4>
                                    </div>
                                    <span className={`font-mono font-bold text-sm ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                                        {isIncome ? "+" : "-"}{(t.amount || 0).toLocaleString('tr-TR')} ₺
                                    </span>
                                </div>

                                {(t.counterparty || t.bankAccount) && (
                                    <div className="text-[11px] text-gray-500 space-y-0.5">
                                        {t.counterparty && <div>Kurum/Kişi: <strong>{t.counterparty}</strong></div>}
                                        {t.bankAccount && <div>Hesap: {t.bankAccount.bankName} - {t.bankAccount.accountName}</div>}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                                    <span>{dStr} {t.documentNo ? `| No: ${t.documentNo}` : ""}</span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(t)}
                                            className="h-6 px-2 text-[11px] text-gray-600"
                                        >
                                            Düzenle
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteId(t.id)}
                                            className="h-6 px-2 text-[11px] text-red-600"
                                        >
                                            Sil
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            İşlemi Sil
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
                            Bu bütçe hareketini silmek istediğinize emin misiniz? Bütçe raporu ve nakit akışı otomatik olarak yeniden hesaplanacaktır.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-2 pt-3">
                        <Button 
                            variant="ghost" 
                            onClick={() => setDeleteId(null)}
                            disabled={isPending}
                        >
                            Vazgeç
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Siliniyor...
                                </>
                            ) : (
                                "Evet, Sil"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
