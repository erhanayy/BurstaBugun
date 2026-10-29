"use client";

import { useState, useEffect, useTransition } from "react";
import { PlusCircle, Loader2, ArrowUpRight, ArrowDownRight, Tag, FileText, Landmark } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBudgetTransaction, BudgetTransactionInput } from "@/lib/actions/budget";
import { toast } from "sonner";

export const INCOME_CATEGORIES = [
    { value: "financing", label: "Finansman / Faiz / Fon Getirisi" },
    { value: "grant", label: "Kurumsal Hibe / Teşvik" },
    { value: "donation_box", label: "Nakit / Kasa Bağışı" },
    { value: "asset_sale", label: "İktisadi İşletme / Menkul Satışı" },
    { value: "other_income", label: "Diğer Gelirler" },
];

export const EXPENSE_CATEGORIES = [
    { value: "it_software", label: "Yazılım, Sunucu & Altyapı" },
    { value: "consultancy", label: "Danışmanlık & Denetim" },
    { value: "accounting_legal", label: "Mali Müşavirlik & Hukuk" },
    { value: "notary_official", label: "Noter, Harç & Resmi Giderler" },
    { value: "bank_pos_fees", label: "Banka Masrafı & POS Komisyonu" },
    { value: "office_rent", label: "Ofis Kirası & İdari Giderler" },
    { value: "event_organization", label: "Etkinlik & Tanıtım" },
    { value: "other_expense", label: "Diğer Giderler" },
];

export function getCategoryLabel(category: string, type: 'income' | 'expense') {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find(c => c.value === category)?.label || category;
}

interface BudgetTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodId: string;
    bankAccounts: Array<{ id: string; bankName: string; accountName: string }>;
    initialData?: any | null;
    defaultType?: 'income' | 'expense';
    onSuccess?: () => void;
}

export function BudgetTransactionDialog({
    open,
    onOpenChange,
    periodId,
    bankAccounts,
    initialData,
    defaultType = 'expense',
    onSuccess,
}: BudgetTransactionDialogProps) {
    const [isPending, startTransition] = useTransition();

    const [type, setType] = useState<'income' | 'expense'>(defaultType);
    const [category, setCategory] = useState(defaultType === 'income' ? 'financing' : 'it_software');
    const [title, setTitle] = useState("");
    const [counterparty, setCounterparty] = useState("");
    const [amount, setAmount] = useState("");
    const [bankAccountId, setBankAccountId] = useState<string>("none");
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().substring(0, 10));
    const [documentNo, setDocumentNo] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (initialData) {
            setType(initialData.type || 'expense');
            setCategory(initialData.category || (initialData.type === 'income' ? 'financing' : 'it_software'));
            setTitle(initialData.title || "");
            setCounterparty(initialData.counterparty || "");
            setAmount(initialData.amount ? String(initialData.amount) : "");
            setBankAccountId(initialData.bankAccountId || "none");
            setTransactionDate(initialData.transactionDate ? new Date(initialData.transactionDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
            setDocumentNo(initialData.documentNo || "");
            setNotes(initialData.notes || "");
        } else {
            setType(defaultType);
            setCategory(defaultType === 'income' ? 'financing' : 'it_software');
            setTitle("");
            setCounterparty("");
            setAmount("");
            setBankAccountId("none");
            setTransactionDate(new Date().toISOString().substring(0, 10));
            setDocumentNo("");
            setNotes("");
        }
    }, [initialData, defaultType, open]);

    const handleTypeChange = (newType: 'income' | 'expense') => {
        setType(newType);
        setCategory(newType === 'income' ? 'financing' : 'it_software');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
            toast.error("Lütfen geçerli bir pozitif tutar giriniz.");
            return;
        }

        if (!title.trim()) {
            toast.error("İşlem başlığı / açıklaması zorunludur.");
            return;
        }

        startTransition(async () => {
            const payload: BudgetTransactionInput = {
                id: initialData?.id,
                periodId,
                type,
                category,
                title: title.trim(),
                counterparty: counterparty.trim() || null,
                amount: Math.round(numAmount),
                bankAccountId: bankAccountId === "none" ? null : bankAccountId,
                transactionDate: new Date(transactionDate),
                documentNo: documentNo.trim() || null,
                notes: notes.trim() || null,
            };

            const res = await saveBudgetTransaction(payload);
            if (res.success) {
                toast.success(initialData ? "İşlem güncellendi." : "İşlem başarıyla eklendi.");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "İşlem kaydedilemedi.");
            }
        });
    };

    const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                        {initialData ? "Bütçe İşlemini Düzenle" : "Yeni Gelir / Gider İşlemi"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Bursiyer ve bağışlar haricindeki operasyonel giderleri ve ek finansman gelirlerini giriniz.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Gelir / Gider Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                                type === 'income'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                            + Gelir (Faiz, Hibe vb.)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                                type === 'expense'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                            }`}
                        >
                            <ArrowDownRight className="w-4 h-4" />
                            - Gider (IT, Danışmanlık vb.)
                        </button>
                    </div>

                    {/* Kategori & Tutar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Kategori *
                            </label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-white dark:bg-zinc-800 text-xs">
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentCategories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Tutar (₺) *
                            </label>
                            <Input
                                type="number"
                                step="any"
                                min="1"
                                placeholder="Örn: 15000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="bg-white dark:bg-zinc-800 font-semibold"
                            />
                        </div>
                    </div>

                    {/* Başlık / Açıklama */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            İşlem Başlığı *
                        </label>
                        <Input
                            placeholder={type === 'income' ? 'Örn: Ekim Ayı Katılım / Faiz Getirisi' : 'Örn: Web Sitesi Sunucu ve Hosting Gideri'}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="bg-white dark:bg-zinc-800 text-sm"
                        />
                    </div>

                    {/* İlgili Taraf (Firma/Kişi) & Banka Hesabı */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {type === 'income' ? 'Kaynak / Kurum (Opsiyonel)' : 'Ödeme Yapılan Firma / Kişi (Opsiyonel)'}
                            </label>
                            <Input
                                placeholder={type === 'income' ? 'Örn: Ziraat Katılım' : 'Örn: Vercel Inc., Noterlik'}
                                value={counterparty}
                                onChange={(e) => setCounterparty(e.target.value)}
                                className="bg-white dark:bg-zinc-800 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Banka / Kasa Hesabı
                            </label>
                            <Select value={bankAccountId} onValueChange={setBankAccountId}>
                                <SelectTrigger className="bg-white dark:bg-zinc-800 text-xs">
                                    <SelectValue placeholder="Hesap Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-xs text-gray-400">
                                        (Hesap Belirtilmedi)
                                    </SelectItem>
                                    {bankAccounts.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="text-xs">
                                            {b.bankName} - {b.accountName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tarih & Belge No */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                İşlem Tarihi *
                            </label>
                            <Input
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                required
                                className="bg-white dark:bg-zinc-800 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Belge / Fatura / Dekont No
                            </label>
                            <Input
                                placeholder="Örn: GİB202600014"
                                value={documentNo}
                                onChange={(e) => setDocumentNo(e.target.value)}
                                className="bg-white dark:bg-zinc-800 text-xs"
                            />
                        </div>
                    </div>

                    {/* Ek Notlar */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Açıklama / Notlar
                        </label>
                        <Input
                            placeholder="İsteğe bağlı ek açıklama"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-white dark:bg-zinc-800 text-xs"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            İptal
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className={type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                initialData ? "Değişiklikleri Kaydet" : (type === 'income' ? "Geliri Kaydet" : "Gideri Kaydet")
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
