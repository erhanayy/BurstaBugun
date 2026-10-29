"use client";

import { useState, useTransition } from "react";
import { Landmark, Plus, Trash2, Loader2, Coins, AlertCircle, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBudgetOpeningBalance, deleteBudgetOpeningBalance, BudgetOpeningBalanceInput } from "@/lib/actions/budget";
import { toast } from "sonner";

interface OpeningBalanceRecord {
    id: string;
    accountName: string;
    bankName: string | null;
    iban: string | null;
    amount: number;
    balanceDate: Date | string;
    notes: string | null;
    bankAccountId?: string | null;
}

interface BudgetOpeningBalanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodId: string;
    periodName: string;
    openingBalances: OpeningBalanceRecord[];
    bankAccounts: Array<{ id: string; bankName: string; accountName: string; iban: string | null }>;
    onSuccess?: () => void;
}

export function BudgetOpeningBalanceDialog({
    open,
    onOpenChange,
    periodId,
    periodName,
    openingBalances,
    bankAccounts,
    onSuccess,
}: BudgetOpeningBalanceDialogProps) {
    const [isPending, startTransition] = useTransition();

    // Form inputs for new entry
    const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("custom");
    const [accountName, setAccountName] = useState("");
    const [bankName, setBankName] = useState("");
    const [iban, setIban] = useState("");
    const [amount, setAmount] = useState("");
    const [balanceDate, setBalanceDate] = useState(new Date().toISOString().substring(0, 10));
    const [notes, setNotes] = useState("");

    // Auto-fill when selecting an existing bank account
    const handleAccountSelect = (val: string) => {
        setSelectedBankAccountId(val);
        if (val === "custom") {
            setAccountName("");
            setBankName("");
            setIban("");
        } else {
            const acc = bankAccounts.find(a => a.id === val);
            if (acc) {
                setAccountName(acc.accountName);
                setBankName(acc.bankName);
                setIban(acc.iban || "");
            }
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        if (isNaN(numAmount) || numAmount < 0) {
            toast.error("Lütfen geçerli bir devir tutarı giriniz.");
            return;
        }

        if (!accountName.trim()) {
            toast.error("Hesap adı zorunludur.");
            return;
        }

        startTransition(async () => {
            const payload: BudgetOpeningBalanceInput = {
                periodId,
                bankAccountId: selectedBankAccountId === "custom" ? null : selectedBankAccountId,
                accountName: accountName.trim(),
                bankName: bankName.trim() || null,
                iban: iban.trim() || null,
                amount: Math.round(numAmount),
                balanceDate: new Date(balanceDate),
                notes: notes.trim() || null,
            };

            const res = await saveBudgetOpeningBalance(payload);
            if (res.success) {
                toast.success("Açılış bakiyesi eklendi.");
                // Reset form
                setAmount("");
                setNotes("");
                setSelectedBankAccountId("custom");
                setAccountName("");
                setBankName("");
                setIban("");
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Kayıt eklenemedi.");
            }
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            const res = await deleteBudgetOpeningBalance(id);
            if (res.success) {
                toast.success("Açılış kaydı silindi.");
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Kayıt silinemedi.");
            }
        });
    };

    const totalAmount = openingBalances.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 max-h-[90vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-500" />
                        {periodName} Dönemi Açılış Kasa / Banka Bakiyeleri
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Bu dönem açılırken banka hesaplarında veya kasada bulunan devir bakiyelerini hesap bazında tanımlayın.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    {/* Existing Balances List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Tanımlı Açılış Hesapları ({openingBalances.length})
                            </h4>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Toplam Açılış: {totalAmount.toLocaleString('tr-TR')} ₺
                            </span>
                        </div>

                        {openingBalances.length === 0 ? (
                            <div className="p-4 text-center rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 text-xs text-gray-500">
                                Bu dönem için henüz bir açılış bakiyesi girilmemiş. Aşağıdaki formu kullanarak ekleyebilirsiniz.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {openingBalances.map((item) => (
                                    <div 
                                        key={item.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                    {item.accountName}
                                                </span>
                                                {item.bankName && (
                                                    <span className="text-[11px] text-gray-500">({item.bankName})</span>
                                                )}
                                            </div>
                                            {item.iban && (
                                                <p className="font-mono text-[11px] text-gray-500">
                                                    {item.iban.replace(/(.{4})/g, '$1 ').trim()}
                                                </p>
                                            )}
                                            {item.notes && (
                                                <p className="text-[11px] text-gray-400 italic">{item.notes}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {(item.amount || 0).toLocaleString('tr-TR')} ₺
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isPending}
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Balance Form */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/60 space-y-3">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            Yeni Açılış Bakiyesi Ekle
                        </h4>

                        <form onSubmit={handleAdd} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Banka Hesabından Seç (Opsiyonel)
                                </label>
                                <Select value={selectedBankAccountId} onValueChange={handleAccountSelect}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-800 text-xs h-9">
                                        <SelectValue placeholder="Banka Hesabı Seç" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom" className="text-xs">
                                            (Manuel Giriş / Kasa Tanımı)
                                        </SelectItem>
                                        {bankAccounts.map(b => (
                                            <SelectItem key={b.id} value={b.id} className="text-xs">
                                                {b.bankName} - {b.accountName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Hesap Adı / Tanımı *
                                    </label>
                                    <Input
                                        placeholder="Örn: Ana Banka Hesabı, Merkez Kasa"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        required
                                        className="bg-white dark:bg-zinc-800 text-xs h-9"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Banka Adı (Opsiyonel)
                                    </label>
                                    <Input
                                        placeholder="Örn: Garanti BBVA"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="bg-white dark:bg-zinc-800 text-xs h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Açılış Tutarı (₺) *
                                    </label>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        placeholder="Örn: 500000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="bg-white dark:bg-zinc-800 font-bold text-xs h-9"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Tarih *
                                    </label>
                                    <Input
                                        type="date"
                                        value={balanceDate}
                                        onChange={(e) => setBalanceDate(e.target.value)}
                                        required
                                        className="bg-white dark:bg-zinc-800 text-xs h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        IBAN (Opsiyonel)
                                    </label>
                                    <Input
                                        placeholder="TR..."
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value)}
                                        className="bg-white dark:bg-zinc-800 text-xs h-9 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Notlar (Opsiyonel)
                                    </label>
                                    <Input
                                        placeholder="Örn: Geçen dönemden devreden bakiye"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="bg-white dark:bg-zinc-800 text-xs h-9"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 font-medium"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Ekleniyor...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            Açılış Bakiyesini Ekle
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onOpenChange(false)}
                    >
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
