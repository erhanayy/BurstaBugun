"use client";

import { Calendar, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MonthlyFlowRow {
    monthKey: string;
    monthLabel: string;
    startingBalance: number;
    bursaryIncome: number;
    extraIncome: number;
    totalIncome: number;
    scholarshipExpense: number;
    operationalExpense: number;
    totalExpense: number;
    netChange: number;
    closingBalance: number;
}

interface MonthlyCashFlowTableProps {
    monthlyData: MonthlyFlowRow[];
    totalOpeningBalance: number;
}

export function MonthlyCashFlowTable({ monthlyData, totalOpeningBalance }: MonthlyCashFlowTableProps) {
    if (!monthlyData || monthlyData.length === 0) {
        return (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500">
                Bu döneme ait aylık nakit hareketi bulunamadı.
            </div>
        );
    }

    const totalBursary = monthlyData.reduce((sum, r) => sum + r.bursaryIncome, 0);
    const totalExtra = monthlyData.reduce((sum, r) => sum + r.extraIncome, 0);
    const grandTotalIncome = totalBursary + totalExtra;

    const totalScholarship = monthlyData.reduce((sum, r) => sum + r.scholarshipExpense, 0);
    const totalOperational = monthlyData.reduce((sum, r) => sum + r.operationalExpense, 0);
    const grandTotalExpense = totalScholarship + totalOperational;

    const finalNetChange = grandTotalIncome - grandTotalExpense;
    const finalClosingBalance = totalOpeningBalance + finalNetChange;

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-zinc-800/70 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-800 font-semibold">
                            <tr>
                                <th className="py-3 px-3.5">Dönem / Ay</th>
                                <th className="py-3 px-3 text-right">Başlangıç Kasa</th>
                                <th className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400">Burs Geliri</th>
                                <th className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400">Ek Gelir</th>
                                <th className="py-3 px-3 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                                    Toplam Gelir
                                </th>
                                <th className="py-3 px-3 text-right text-red-700 dark:text-red-400">Bursiyer Ödemesi</th>
                                <th className="py-3 px-3 text-right text-red-700 dark:text-red-400">Operasyonel Gider</th>
                                <th className="py-3 px-3 text-right font-bold text-red-800 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20">
                                    Toplam Gider
                                </th>
                                <th className="py-3 px-3 text-right font-bold">Aylık Net Akış</th>
                                <th className="py-3 px-3.5 text-right font-bold text-blue-900 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/20">
                                    Dönem Sonu Kasa
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                            {monthlyData.map((row) => {
                                const isPositive = row.netChange >= 0;
                                const isClosingPositive = row.closingBalance >= 0;

                                return (
                                    <tr key={row.monthKey} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-3 px-3.5 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{row.monthLabel}</span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                                            {row.startingBalance.toLocaleString('tr-TR')} ₺
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                            {row.bursaryIncome > 0 ? `${row.bursaryIncome.toLocaleString('tr-TR')} ₺` : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                            {row.extraIncome > 0 ? `${row.extraIncome.toLocaleString('tr-TR')} ₺` : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                                            {row.totalIncome > 0 ? `+${row.totalIncome.toLocaleString('tr-TR')} ₺` : "0 ₺"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                            {row.scholarshipExpense > 0 ? `${row.scholarshipExpense.toLocaleString('tr-TR')} ₺` : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                            {row.operationalExpense > 0 ? `${row.operationalExpense.toLocaleString('tr-TR')} ₺` : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-bold text-red-700 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10">
                                            {row.totalExpense > 0 ? `-${row.totalExpense.toLocaleString('tr-TR')} ₺` : "0 ₺"}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-semibold">
                                            <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                                {isPositive ? "+" : ""}{row.netChange.toLocaleString('tr-TR')} ₺
                                            </span>
                                        </td>
                                        <td className={`py-3 px-3.5 text-right font-mono font-bold bg-blue-50/30 dark:bg-blue-950/10 ${
                                            isClosingPositive ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"
                                        }`}>
                                            {row.closingBalance.toLocaleString('tr-TR')} ₺
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* Footer Summary Row */}
                        <tfoot className="bg-gray-100/80 dark:bg-zinc-800 text-gray-900 dark:text-white border-t-2 border-gray-200 dark:border-zinc-700 font-bold">
                            <tr>
                                <td className="py-3.5 px-3.5">Dönem Toplamı</td>
                                <td className="py-3.5 px-3 text-right font-mono text-gray-500 dark:text-gray-400">
                                    {totalOpeningBalance.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                                    {totalBursary.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                                    {totalExtra.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/40">
                                    +{grandTotalIncome.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-red-700 dark:text-red-400">
                                    {totalScholarship.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-red-700 dark:text-red-400">
                                    {totalOperational.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-red-800 dark:text-red-300 bg-red-100/50 dark:bg-red-950/40">
                                    -{grandTotalExpense.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono">
                                    <span className={finalNetChange >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                                        {finalNetChange >= 0 ? "+" : ""}{finalNetChange.toLocaleString('tr-TR')} ₺
                                    </span>
                                </td>
                                <td className="py-3.5 px-3.5 text-right font-mono text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-950/40 text-sm">
                                    {finalClosingBalance.toLocaleString('tr-TR')} ₺
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="lg:hidden space-y-3">
                {monthlyData.map((row) => {
                    const isPositive = row.netChange >= 0;
                    return (
                        <div 
                            key={row.monthKey}
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                                        {row.monthLabel}
                                    </span>
                                </div>
                                <Badge 
                                    variant="outline" 
                                    className={isPositive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}
                                >
                                    {isPositive ? "+" : ""}{row.netChange.toLocaleString('tr-TR')} ₺
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                                    <span className="text-gray-500 dark:text-gray-400 block font-medium">Toplam Gelir</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm block">
                                        +{row.totalIncome.toLocaleString('tr-TR')} ₺
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">
                                        Burs: {row.bursaryIncome.toLocaleString('tr-TR')} ₺ | Ek: {row.extraIncome.toLocaleString('tr-TR')} ₺
                                    </span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 space-y-1">
                                    <span className="text-gray-500 dark:text-gray-400 block font-medium">Toplam Gider</span>
                                    <span className="font-bold text-red-700 dark:text-red-400 text-sm block">
                                        -{row.totalExpense.toLocaleString('tr-TR')} ₺
                                    </span>
                                    <span className="text-[10px] text-gray-500 block">
                                        Bursiyer: {row.scholarshipExpense.toLocaleString('tr-TR')} ₺ | Op: {row.operationalExpense.toLocaleString('tr-TR')} ₺
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs text-gray-600 dark:text-gray-300">
                                <span>Ay Başı: {row.startingBalance.toLocaleString('tr-TR')} ₺</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    Kapanış: {row.closingBalance.toLocaleString('tr-TR')} ₺
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
