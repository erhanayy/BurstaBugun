"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
    PieChart, Landmark, Plus, Coins, ArrowUpRight, ArrowDownRight, 
    Wallet, FileSpreadsheet, RefreshCw, Calendar, CheckCircle2, 
    TrendingUp, TrendingDown, Layers, HelpCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetTransactionDialog, getCategoryLabel } from "./budget-transaction-dialog";
import { BudgetOpeningBalanceDialog } from "./budget-opening-balance-dialog";
import { MonthlyCashFlowTable } from "./monthly-cash-flow-table";
import { BudgetTransactionsTable } from "./budget-transactions-table";
import Link from "next/link";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface BudgetDashboardProps {
    initialData: any;
}

export function BudgetDashboard({ initialData }: BudgetDashboardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const {
        hasSeasons,
        seasons = [],
        activeSeason,
        bankAccounts = [],
        openingBalances = [],
        transactions = [],
        kpis = {},
        monthlyCashFlow = []
    } = initialData || {};

    // Dialog states
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [transactionDefaultType, setTransactionDefaultType] = useState<'income' | 'expense'>('expense');
    const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
    const [isOpeningBalanceDialogOpen, setIsOpeningBalanceDialogOpen] = useState(false);

    // Period selector handler
    const handleSeasonChange = (seasonId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("period", seasonId);
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleOpenNewTransaction = (defaultT: 'income' | 'expense' = 'expense') => {
        setEditingTransaction(null);
        setTransactionDefaultType(defaultT);
        setIsTransactionDialogOpen(true);
    };

    const handleEditTransaction = (tx: any) => {
        setEditingTransaction(tx);
        setTransactionDefaultType(tx.type);
        setIsTransactionDialogOpen(true);
    };

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    // Excel Export
    const handleExportExcel = () => {
        try {
            const wb = XLSX.utils.book_new();

            // 1. Özet Bütçe Sayfası
            const summaryData = [
                ["DÖNEMSEL BÜTÇE VE KASA RAPORU"],
                ["Dönem:", activeSeason?.period || "-"],
                ["Rapor Tarihi:", new Date().toLocaleDateString('tr-TR')],
                [],
                ["GÖSTERGE", "TUTAR (TL)", "AÇIKLAMA"],
                ["Dönem Açılış Bakiyesi", kpis.totalOpeningBalance || 0, `${openingBalances.length} banka/kasa hesabından devir`],
                ["Burs Gelirleri (Kredi Kartı)", kpis.bursaryCreditCardTotal || 0, "Abonelik ve Online Kart Tahsilatları"],
                ["Burs Gelirleri (Havale / EFT)", kpis.bursaryWireTransferTotal || 0, "Banka Havale/EFT Bağışları"],
                ["Ek Gelirler (Finansman, Hibe vb.)", kpis.totalExtraIncome || 0, "Burs dışı diğer gelirler"],
                ["TOPLAM GELİR", kpis.totalIncome || 0, "Burs + Ek Gelirler Toplamı"],
                ["Bursiyer Ödemeleri (Burs Dağıtımı)", kpis.totalScholarshipExpense || 0, "Öğrencilere aktarılan burs tutarları"],
                ["Operasyonel Giderler", kpis.totalOperationalExpense || 0, "Yazılım, danışmanlık, noter, banka masrafları vb."],
                ["TOPLAM GİDER", kpis.totalExpense || 0, "Bursiyer + Operasyonel Giderler Toplamı"],
                ["DÖNEM NET KASA / BANKA BAKİYESİ", kpis.netCashBalance || 0, "Açılış + Gelirler - Giderler"],
                [],
                ["BURS TAAHHÜTLERİ", "", ""],
                ["Toplam Taahhüt Hedefi", kpis.totalPledgeTarget || 0, ""],
                ["Gerçekleşen Tahsilat", kpis.totalPledgeActual || 0, ""],
                ["Gerçekleşme Oranı", `%${kpis.pledgeRealizationRate || 0}`, ""],
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Bütçe Özeti");

            // 2. Aylık Nakit Akışı Sayfası
            const cashFlowHeaders = [
                ["AY / DÖNEM", "BAŞLANGIÇ KASA", "BURS GELİRİ", "EK GELİR", "TOPLAM GELİR", "BURSİYER ÖDEMESİ", "OPERASYONEL GİDER", "TOPLAM GİDER", "NET AKIŞ", "KAPANIŞ KASA"]
            ];
            const cashFlowRows = monthlyCashFlow.map((m: any) => [
                m.monthLabel,
                m.startingBalance,
                m.bursaryIncome,
                m.extraIncome,
                m.totalIncome,
                m.scholarshipExpense,
                m.operationalExpense,
                m.totalExpense,
                m.netChange,
                m.closingBalance
            ]);
            const wsCashFlow = XLSX.utils.aoa_to_sheet([...cashFlowHeaders, ...cashFlowRows]);
            XLSX.utils.book_append_sheet(wb, wsCashFlow, "Aylık Nakit Akışı");

            // 3. İşlem Hareketleri Sayfası
            const txHeaders = [
                ["TARİH", "TÜR", "KATEGORİ", "İŞLEM BAŞLIĞI", "İLGİLİ KURUM/KİŞİ", "BANKA / KASA", "TUTAR (TL)", "BELGE NO", "AÇIKLAMA"]
            ];
            const txRows = transactions.map((t: any) => [
                new Date(t.transactionDate).toLocaleDateString('tr-TR'),
                t.type === 'income' ? 'Gelir (+)' : 'Gider (-)',
                getCategoryLabel(t.category, t.type),
                t.title,
                t.counterparty || '',
                t.bankAccount ? `${t.bankAccount.bankName} - ${t.bankAccount.accountName}` : '',
                t.amount,
                t.documentNo || '',
                t.notes || ''
            ]);
            const wsTx = XLSX.utils.aoa_to_sheet([...txHeaders, ...txRows]);
            XLSX.utils.book_append_sheet(wb, wsTx, "Gelir-Gider Hareketleri");

            // 4. Açılış Bakiyeleri Sayfası
            const openingHeaders = [
                ["HESAP TANIMI", "BANKA ADI", "IBAN", "TARİH", "AÇILIŞ TUTARI (TL)", "NOTLAR"]
            ];
            const openingRows = openingBalances.map((o: any) => [
                o.accountName,
                o.bankName || '',
                o.iban || '',
                new Date(o.balanceDate).toLocaleDateString('tr-TR'),
                o.amount,
                o.notes || ''
            ]);
            const wsOpening = XLSX.utils.aoa_to_sheet([...openingHeaders, ...openingRows]);
            XLSX.utils.book_append_sheet(wb, wsOpening, "Açılış Bakiyeleri");

            XLSX.writeFile(wb, `Butce_ve_Kasa_Raporu_${activeSeason?.period || 'Donem'}.xlsx`);
            toast.success("Excel bütçe raporu başarıyla indirildi.");
        } catch (err: any) {
            console.error("Excel export error:", err);
            toast.error("Excel dosyası oluşturulurken hata meydana geldi.");
        }
    };

    if (!hasSeasons) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                <PieChart className="w-12 h-12 mx-auto text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aktif Dönem Bulunamadı</h2>
                <p className="text-xs text-gray-500">
                    Bütçe ve kasa takibi yapabilmek için lütfen önce Parametreler bölümünden bir akademik dönem (örn. 2026-2027) tanımlayınız.
                </p>
                <Link href="/dashboard/admin/parameters">
                    <Button className="bg-blue-600 text-white text-xs">
                        Parametrelere Git
                    </Button>
                </Link>
            </div>
        );
    }

    const netChange = (kpis.totalIncome || 0) - (kpis.totalExpense || 0);
    const isNetPositive = (kpis.netCashBalance || 0) >= 0;

    return (
        <div className="space-y-6">
            {/* Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Akademik Dönem:
                        </span>
                        <Select 
                            value={activeSeason?.id} 
                            onValueChange={handleSeasonChange}
                            disabled={isPending}
                        >
                            <SelectTrigger className="w-[180px] font-bold text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                                <SelectValue placeholder="Dönem Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {seasons.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id} className="font-semibold text-xs">
                                        {s.period} {s.isDefault ? "(Aktif Varsayılan)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="h-8 text-xs text-gray-500 hover:text-gray-900 gap-1 self-start sm:self-auto"
                        title="Yenile"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpeningBalanceDialogOpen(true)}
                        className="text-xs gap-1.5 bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
                    >
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        Açılış Bakiyesi Yönet
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="text-xs gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        Excel Raporu
                    </Button>

                    <Button
                        onClick={() => handleOpenNewTransaction('expense')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Yeni İşlem Ekle
                    </Button>
                </div>
            </div>

            {/* 5 KPI Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Dönem Açılış Bakiyesi */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Dönem Açılış
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                            <Coins className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
                            {(kpis.totalOpeningBalance || 0).toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            {openingBalances.length} banka/kasa devri
                        </p>
                    </div>
                </div>

                {/* 2. Toplam Gelir */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                            Toplam Gelir
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                            +{(kpis.totalIncome || 0).toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Burs: {(kpis.totalBursaryIncome || 0).toLocaleString('tr-TR')} ₺ | Ek: {(kpis.totalExtraIncome || 0).toLocaleString('tr-TR')} ₺
                        </p>
                    </div>
                </div>

                {/* 3. Toplam Gider */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                            Toplam Gider
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-red-600 dark:text-red-400 font-mono tracking-tight">
                            -{(kpis.totalExpense || 0).toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Bursiyer: {(kpis.totalScholarshipExpense || 0).toLocaleString('tr-TR')} ₺ | Op: {(kpis.totalOperationalExpense || 0).toLocaleString('tr-TR')} ₺
                        </p>
                    </div>
                </div>

                {/* 4. Güncel Net Kasa / Banka */}
                <div className={`rounded-xl p-4 border shadow-xs flex flex-col justify-between ${
                    isNetPositive 
                        ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-zinc-900 dark:to-zinc-900 border-blue-200 dark:border-zinc-800'
                        : 'bg-red-50/50 dark:bg-zinc-900 border-red-200 dark:border-zinc-800'
                }`}>
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                            Güncel Kasa / Banka
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className={`text-xl font-extrabold font-mono tracking-tight ${
                            isNetPositive ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'
                        }`}>
                            {(kpis.netCashBalance || 0).toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Net Akış: {netChange >= 0 ? '+' : ''}{netChange.toLocaleString('tr-TR')} ₺
                        </p>
                    </div>
                </div>

                {/* 5. Burs Taahhüt Gerçekleşmesi */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                            Taahhüt Oranı
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold text-xs">
                            %{kpis.pledgeRealizationRate || 0}
                        </div>
                    </div>
                    <div>
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, kpis.pledgeRealizationRate || 0)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">
                            {(kpis.totalPledgeActual || 0).toLocaleString('tr-TR')} ₺ / {(kpis.totalPledgeTarget || 0).toLocaleString('tr-TR')} ₺
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Micro Incomes & Expenses Overview Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gelir Detayları */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white pb-1 border-b border-gray-100 dark:border-zinc-800">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                            <ArrowUpRight className="w-4 h-4" /> Gelir Bileşenleri
                        </span>
                        <span className="font-mono text-emerald-600">+{(kpis.totalIncome || 0).toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="space-y-1.5 pt-1 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                            <span>Bursveren Kredi Kartı / Abonelik:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">{(kpis.bursaryCreditCardTotal || 0).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Bursveren Havale / EFT:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">{(kpis.bursaryWireTransferTotal || 0).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Ek Finansman / Diğer Gelirler:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">{(kpis.totalExtraIncome || 0).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                    </div>
                </div>

                {/* Gider Detayları */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white pb-1 border-b border-gray-100 dark:border-zinc-800">
                        <span className="flex items-center gap-1.5 text-red-600">
                            <ArrowDownRight className="w-4 h-4" /> Gider Bileşenleri
                        </span>
                        <span className="font-mono text-red-600">-{(kpis.totalExpense || 0).toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="space-y-1.5 pt-1 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                            <span>Bursiyerlere Yapılan Ödemeler:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">{(kpis.totalScholarshipExpense || 0).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Operasyonel & İdari Giderler:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">{(kpis.totalOperationalExpense || 0).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Giderlerin Bursiyer Oranı:</span>
                            <strong className="text-gray-900 dark:text-white font-mono">
                                %{kpis.totalExpense > 0 ? Math.round(((kpis.totalScholarshipExpense || 0) / kpis.totalExpense) * 100) : 0}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs defaultValue="cashflow" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <TabsTrigger value="cashflow" className="text-xs font-semibold gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Aylık Nakit Akışı ({monthlyCashFlow.length} Ay)
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="text-xs font-semibold gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Gelir & Gider Hareketleri ({transactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="text-xs font-semibold gap-1.5">
                        <PieChart className="w-3.5 h-3.5" />
                        Kategori Dağılımı
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Monthly Cash Flow */}
                <TabsContent value="cashflow" className="space-y-4 focus-visible:outline-none">
                    <MonthlyCashFlowTable 
                        monthlyData={monthlyCashFlow} 
                        totalOpeningBalance={kpis.totalOpeningBalance || 0} 
                    />
                </TabsContent>

                {/* Tab 2: Transactions */}
                <TabsContent value="transactions" className="space-y-4 focus-visible:outline-none">
                    <BudgetTransactionsTable
                        transactions={transactions}
                        onEdit={handleEditTransaction}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                {/* Tab 3: Category Breakdown */}
                <TabsContent value="categories" className="space-y-4 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Expense Categories */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                                Operasyonel Gider Dağılımı
                            </h3>

                            {Object.keys(kpis.expenseBreakdown || {}).length === 0 ? (
                                <p className="text-xs text-gray-400 py-6 text-center">Bu dönem için kayıtlı operasyonel gider bulunmamaktadır.</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(kpis.expenseBreakdown as Record<string, number>).map(([cat, amt]) => {
                                        const pct = kpis.totalOperationalExpense > 0 ? Math.round((amt / kpis.totalOperationalExpense) * 100) : 0;
                                        return (
                                            <div key={cat} className="space-y-1 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {getCategoryLabel(cat, 'expense')}
                                                    </span>
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                                                        {amt.toLocaleString('tr-TR')} ₺ (%{pct})
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-red-500 h-full rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Income Categories */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                Ek Gelir Dağılımı
                            </h3>

                            {Object.keys(kpis.incomeBreakdown || {}).length === 0 ? (
                                <p className="text-xs text-gray-400 py-6 text-center">Bu dönem için kayıtlı ek finansman geliri bulunmamaktadır.</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(kpis.incomeBreakdown as Record<string, number>).map(([cat, amt]) => {
                                        const pct = kpis.totalExtraIncome > 0 ? Math.round((amt / kpis.totalExtraIncome) * 100) : 0;
                                        return (
                                            <div key={cat} className="space-y-1 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {getCategoryLabel(cat, 'income')}
                                                    </span>
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                                                        {amt.toLocaleString('tr-TR')} ₺ (%{pct})
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-emerald-500 h-full rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Transaction Add / Edit Dialog */}
            <BudgetTransactionDialog
                open={isTransactionDialogOpen}
                onOpenChange={setIsTransactionDialogOpen}
                periodId={activeSeason?.id}
                bankAccounts={bankAccounts}
                initialData={editingTransaction}
                defaultType={transactionDefaultType}
                onSuccess={handleRefresh}
            />

            {/* Opening Balance Dialog */}
            <BudgetOpeningBalanceDialog
                open={isOpeningBalanceDialogOpen}
                onOpenChange={setIsOpeningBalanceDialogOpen}
                periodId={activeSeason?.id}
                periodName={activeSeason?.period || ''}
                openingBalances={openingBalances}
                bankAccounts={bankAccounts}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
