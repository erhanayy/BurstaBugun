"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { chargeSubscriptionPayments } from "@/lib/actions/moka-actions";

type Subscription = {
    id: string;
    fundName: string;
    studentName: string;
    sponsorName: string;
    amount: number;
    dueDate: string;
    status: string;
    userId: string;
};

export default function SubscriptionList({ initialData }: { initialData: Subscription[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isCharging, setIsCharging] = useState(false);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // Extract unique years from data
    const years = Array.from(new Set(initialData.map(d => new Date(d.dueDate).getFullYear().toString()))).sort();
    if (!years.includes(new Date().getFullYear().toString())) {
        years.push(new Date().getFullYear().toString());
    }

    const filteredData = initialData.filter(item => {
        const date = new Date(item.dueDate);
        const matchYear = selectedYear === "all" || date.getFullYear().toString() === selectedYear;
        const matchMonth = selectedMonth === "all" || (date.getMonth() + 1).toString() === selectedMonth;
        return matchYear && matchMonth;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredData.map(d => d.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleCharge = async (paymentIds: string[]) => {
        if (paymentIds.length === 0) return;
        
        setIsCharging(true);
        try {
            const result = await chargeSubscriptionPayments(paymentIds);
            if (result.success) {
                alert("İşlem Başarılı: " + result.message);
                setSelectedIds([]);
                window.location.reload(); // Refresh the page to get updated list
            } else {
                alert("Hata: " + (result.error || "Çekim sırasında bir hata oluştu."));
            }
        } catch (e) {
            alert("Hata: Sunucu ile iletişim kurulamadı.");
        } finally {
            setIsCharging(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar & Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                    >
                        <option value="all">Tüm Aylar</option>
                        <option value="1">Ocak</option>
                        <option value="2">Şubat</option>
                        <option value="3">Mart</option>
                        <option value="4">Nisan</option>
                        <option value="5">Mayıs</option>
                        <option value="6">Haziran</option>
                        <option value="7">Temmuz</option>
                        <option value="8">Ağustos</option>
                        <option value="9">Eylül</option>
                        <option value="10">Ekim</option>
                        <option value="11">Kasım</option>
                        <option value="12">Aralık</option>
                    </select>

                    <select 
                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                    >
                        <option value="all">Tüm Yıllar</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-sm text-gray-500 font-medium">
                        {filteredData.length} kayıt, {selectedIds.length} seçili
                    </span>
                    <Button 
                        disabled={selectedIds.length === 0 || isCharging}
                        onClick={() => handleCharge(selectedIds)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isCharging ? 'İşleniyor...' : `Seçilenleri Çek (${selectedIds.length})`}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 w-12 text-center">
                                <Checkbox 
                                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3">Ödeme Tarihi</th>
                            <th className="px-4 py-3">Bursveren</th>
                            <th className="px-4 py-3">Fon Adı</th>
                            <th className="px-4 py-3">Tutar</th>
                            <th className="px-4 py-3">Müşteri (Token) Kodu</th>
                            <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    Bu dönem için bekleyen tahsilat kaydı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-center">
                                        <Checkbox 
                                            checked={selectedIds.includes(item.id)}
                                            onCheckedChange={(c) => handleSelect(item.id, c as boolean)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {format(new Date(item.dueDate), 'd MMMM yyyy', { locale: tr })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{item.sponsorName}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.fundName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-gray-900">{item.amount.toLocaleString('tr-TR')} ₺</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                            {item.userId.substring(0, 8)}...
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            disabled={isCharging}
                                            onClick={() => handleCharge([item.id])}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                        >
                                            KK'dan Çek
                                        </Button>
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
