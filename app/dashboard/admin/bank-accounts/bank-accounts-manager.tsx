"use client";

import { useState, useTransition } from "react";
import { 
    Landmark, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
    Copy, Check, Search, AlertCircle, Loader2, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { saveTenantBankAccount, deleteTenantBankAccount, toggleBankAccountStatus, BankAccountInput } from "@/lib/actions/bank-accounts";
import { toast } from "sonner";

interface BankAccount {
    id: string;
    bankName: string;
    accountName: string;
    iban: string | null;
    accountNumber: string | null;
    currency: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date | string;
}

export function BankAccountsManager({ initialAccounts }: { initialAccounts: BankAccount[] }) {
    const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    // Form states
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [iban, setIban] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [currency, setCurrency] = useState("TRY");
    const [displayOrder, setDisplayOrder] = useState("0");
    const [copiedIban, setCopiedIban] = useState<string | null>(null);

    // Delete confirm dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const openCreateDialog = () => {
        setEditingAccount(null);
        setBankName("");
        setAccountName("");
        setIban("");
        setAccountNumber("");
        setCurrency("TRY");
        setDisplayOrder(String(accounts.length + 1));
        setIsDialogOpen(true);
    };

    const openEditDialog = (account: BankAccount) => {
        setEditingAccount(account);
        setBankName(account.bankName);
        setAccountName(account.accountName);
        setIban(account.iban || "");
        setAccountNumber(account.accountNumber || "");
        setCurrency(account.currency || "TRY");
        setDisplayOrder(String(account.displayOrder || 0));
        setIsDialogOpen(true);
    };

    const handleCopyIban = (ibanStr: string) => {
        navigator.clipboard.writeText(ibanStr.replace(/\s+/g, ''));
        setCopiedIban(ibanStr);
        toast.success("IBAN panoya kopyalandı");
        setTimeout(() => setCopiedIban(null), 2000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankName.trim()) {
            toast.error("Banka adı zorunludur");
            return;
        }
        if (!accountName.trim()) {
            toast.error("Hesap adı zorunludur");
            return;
        }

        startTransition(async () => {
            const payload: BankAccountInput = {
                id: editingAccount?.id,
                bankName: bankName.trim(),
                accountName: accountName.trim(),
                iban: iban.trim() || null,
                accountNumber: accountNumber.trim() || null,
                currency: currency || "TRY",
                displayOrder: parseInt(displayOrder) || 0,
                isActive: editingAccount ? editingAccount.isActive : true,
            };

            const res = await saveTenantBankAccount(payload);
            if (res.success) {
                toast.success(editingAccount ? "Banka hesabı güncellendi." : "Yeni banka hesabı eklendi.");
                setIsDialogOpen(false);
                // Refresh list locally
                if (editingAccount) {
                    setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...payload, iban: payload.iban || null, accountNumber: payload.accountNumber || null } as BankAccount : a));
                } else {
                    // Quick optimistic addition
                    window.location.reload();
                }
            } else {
                toast.error(res.error || "İşlem başarısız.");
            }
        });
    };

    const handleToggleStatus = (account: BankAccount) => {
        const nextStatus = !account.isActive;
        startTransition(async () => {
            const res = await toggleBankAccountStatus(account.id, nextStatus);
            if (res.success) {
                toast.success(nextStatus ? "Hesap aktifleştirildi." : "Hesap pasifleştirildi.");
                setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, isActive: nextStatus } : a));
            } else {
                toast.error(res.error || "Durum güncellenemedi.");
            }
        });
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        startTransition(async () => {
            const res = await deleteTenantBankAccount(deleteId);
            if (res.success) {
                toast.success("Banka hesabı silindi.");
                setAccounts(prev => prev.filter(a => a.id !== deleteId));
                setDeleteId(null);
            } else {
                toast.error(res.error || "Hesap silinemedi.");
            }
        });
    };

    const filteredAccounts = accounts.filter(a => {
        const query = search.toLowerCase();
        return (
            a.bankName.toLowerCase().includes(query) ||
            a.accountName.toLowerCase().includes(query) ||
            (a.iban && a.iban.toLowerCase().includes(query)) ||
            (a.accountNumber && a.accountNumber.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-6">
            {/* Header & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Banka, hesap adı veya IBAN ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-sm"
                    />
                </div>
                <Button 
                    onClick={openCreateDialog} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Hesap Ekle
                </Button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800 font-medium">
                        <tr>
                            <th className="py-3.5 px-4 w-12 text-center">Sıra</th>
                            <th className="py-3.5 px-4">Banka & Kurum</th>
                            <th className="py-3.5 px-4">Hesap Tanımı</th>
                            <th className="py-3.5 px-4">IBAN / Hesap No</th>
                            <th className="py-3.5 px-4 w-24">Para Birimi</th>
                            <th className="py-3.5 px-4 w-28 text-center">Durum</th>
                            <th className="py-3.5 px-4 w-28 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                    <Landmark className="w-10 h-10 mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
                                    <p className="font-medium">Kayıtlı banka hesabı bulunamadı.</p>
                                    <p className="text-xs text-gray-400 mt-1">Vakfınızın banka veya kasa hesaplarını ekleyerek başlayabilirsiniz.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                    <td className="py-3.5 px-4 text-center text-xs text-gray-500 font-mono">
                                        {account.displayOrder}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                        <span>{account.bankName}</span>
                                    </td>
                                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-200">
                                        {account.accountName}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {account.iban ? (
                                            <div className="flex items-center gap-2 group">
                                                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                                                    {account.iban.replace(/(.{4})/g, '$1 ').trim()}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyIban(account.iban!)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-600 rounded"
                                                    title="IBAN Kopyala"
                                                >
                                                    {copiedIban === account.iban ? (
                                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        ) : account.accountNumber ? (
                                            <span className="font-mono text-xs text-gray-500">No: {account.accountNumber}</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">-</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <Badge variant="outline" className="font-mono text-xs uppercase bg-gray-50 dark:bg-zinc-800">
                                            {account.currency || "TRY"}
                                        </Badge>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(account)}
                                            disabled={isPending}
                                            className="inline-flex items-center cursor-pointer transition-transform active:scale-95"
                                            title="Durumu Değiştir"
                                        >
                                            {account.isActive ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1 text-xs">
                                                    <CheckCircle2 className="w-3 h-3" /> Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500 dark:text-gray-400 gap-1 text-xs">
                                                    <XCircle className="w-3 h-3" /> Pasif
                                                </Badge>
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(account)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                                title="Düzenle"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(account.id)}
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredAccounts.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <Landmark className="w-10 h-10 mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300">Kayıtlı banka hesabı bulunamadı.</p>
                    </div>
                ) : (
                    filteredAccounts.map((account) => (
                        <div 
                            key={account.id}
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                        <Landmark className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{account.bankName}</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{account.accountName}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleToggleStatus(account)}>
                                    {account.isActive ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px]">
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-500 text-[11px]">
                                            Pasif
                                        </Badge>
                                    )}
                                </button>
                            </div>

                            {account.iban && (
                                <div className="p-2 rounded bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs">
                                    <span className="font-mono text-gray-800 dark:text-gray-200 break-all">
                                        {account.iban.replace(/(.{4})/g, '$1 ').trim()}
                                    </span>
                                    <button 
                                        onClick={() => handleCopyIban(account.iban!)} 
                                        className="p-1 text-gray-400 hover:text-blue-600"
                                    >
                                        {copiedIban === account.iban ? (
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
                                <span>Para Birimi: <strong className="text-gray-700 dark:text-gray-300">{account.currency}</strong></span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(account)}
                                        className="h-7 px-2.5 text-xs text-gray-600"
                                    >
                                        <Edit2 className="w-3 h-3 mr-1" /> Düzenle
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteId(account.id)}
                                        className="h-7 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Sil
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-blue-600" />
                            {editingAccount ? "Banka Hesabını Düzenle" : "Yeni Banka / Kasa Hesabı Ekle"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Vakfınıza ait banka hesabı veya nakit kasa tanımını giriniz.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Banka / Kurum Adı *
                                </label>
                                <Input
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="Örn: Ziraat Bankası, Kasa"
                                    required
                                    className="bg-white dark:bg-zinc-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Hesap Tanımı / Adı *
                                </label>
                                <Input
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="Örn: Ana Bağış Hesabı"
                                    required
                                    className="bg-white dark:bg-zinc-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                IBAN (Opsiyonel)
                            </label>
                            <Input
                                value={iban}
                                onChange={(e) => setIban(e.target.value)}
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                className="bg-white dark:bg-zinc-800 font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Hesap No / Şube
                                </label>
                                <Input
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Opsiyonel"
                                    className="bg-white dark:bg-zinc-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Para Birimi
                                </label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="bg-white dark:bg-zinc-800">
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TRY">TRY (₺)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Görüntüleme Sırası
                                </label>
                                <Input
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                    min="0"
                                    className="bg-white dark:bg-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isPending}
                            >
                                İptal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    editingAccount ? "Güncelle" : "Hesabı Kaydet"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Banka Hesabını Sil
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
                            Bu hesabı silmek istediğinize emin misiniz? Bu işlem geri alınamaz. 
                            Hesaba bağlı geçmiş bütçe işlemleri varsa hesap bağlantısı kaldırılacaktır.
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
