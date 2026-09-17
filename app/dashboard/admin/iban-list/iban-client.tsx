"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Search, Bell, CheckCircle, AlertCircle, RefreshCw, Download } from "lucide-react";
import { sendIbanReminder } from "@/lib/actions/admin-iban";
import { maskFullName, maskIban } from "@/lib/utils";

interface StudentInfo {
    applicationId: string;
    userId: string;
    fullName: string;
    email: string;
    ibanName: string;
    iban: string;
    fundName: string;
}

interface IbanClientProps {
    periods: { id: string, period: string }[];
    activePeriod: string;
    searchQuery: string;
    statusFilter: string;
    initialStudents: StudentInfo[];
}

export function IbanClient({ periods, activePeriod, searchQuery, statusFilter, initialStudents }: IbanClientProps) {
    const router = useRouter();
    const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
    const [nameQuery, setNameQuery] = useState(searchQuery);
    const [selectedStatus, setSelectedStatus] = useState(statusFilter);
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSearch = () => {
        router.push(`/dashboard/admin/iban-list?period=${selectedPeriod}&q=${encodeURIComponent(nameQuery)}&status=${selectedStatus}`);
    };

    const handleExportExcel = () => {
        if (initialStudents.length === 0) {
            setToast({ message: "Dışa aktarılacak veri bulunamadı.", type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const headers = ["Öğrenci Adı", "Seçilen Fon", "Banka Hesap Adı", "IBAN Numarası"];
        const rows = initialStudents.map(s => [
            s.fullName,
            s.fundName,
            s.ibanName || "Boş",
            s.iban || "Boş"
        ]);

        const csvContent = [
            headers.join(";"),
            ...rows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const p = periods.find(p => p.id === selectedPeriod);
        link.setAttribute("download", `iban_listesi_${p ? p.period : 'disa_aktarim'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendReminder = async (student: StudentInfo) => {
        if (!student.userId) return;
        setSendingReminder(student.userId);
        
        const activePeriodText = periods.find(p => p.id === activePeriod)?.period || activePeriod;
        const res = await sendIbanReminder(student.userId, activePeriodText);
        if (res.success) {
            setToast({ message: `${student.fullName} kullanıcısına hatırlatma gönderildi.`, type: 'success' });
        } else {
            setToast({ message: res.error || "Hatırlatma gönderilirken hata oluştu.", type: 'error' });
        }
        
        setTimeout(() => setToast(null), 3000);
        setSendingReminder(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Bursiyer IBAN Listesi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Seçili dönemde fona seçilmiş öğrencilerin IBAN bilgilerini takip edin.
                    </p>
                </div>
            </div>

            {toast && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 sm:max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dönem Seçin</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        >
                            {periods.length === 0 && <option value="">Dönem Bulunamadı</option>}
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>{p.period}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Öğrenci Adı Ara</label>
                        <input
                            type="text"
                            placeholder="Ad soyad ile arayın..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        />
                    </div>
                    <div className="flex-1 sm:max-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN Durumu</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        >
                            <option value="all">Hepsi</option>
                            <option value="entered">IBAN Girilmişler</option>
                            <option value="missing">Eksik Olanlar</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 h-[38px]"
                        >
                            <Search className="w-4 h-4" /> Ara
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 h-[38px]"
                            title="Listeyi Excel (CSV) olarak indir"
                        >
                            <Download className="w-4 h-4" /> Excel'e Aktar
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Öğrenci Adı</th>
                                <th className="px-6 py-4 font-semibold">Seçilen Fon</th>
                                <th className="px-6 py-4 font-semibold">Banka Hesap Adı</th>
                                <th className="px-6 py-4 font-semibold">IBAN Numarası</th>
                                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {initialStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Bu döneme ait seçilmiş bursiyer bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                initialStudents.map((student) => (
                                    <tr key={student.applicationId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {student.fundName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.ibanName ? (
                                                <span className="text-gray-900 dark:text-gray-300 font-medium">{student.ibanName}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">- Boş -</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.iban ? (
                                                <span className="text-gray-900 dark:text-gray-300 font-mono text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700">
                                                    {student.iban}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">- Boş -</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!student.iban ? (
                                                <button
                                                    onClick={() => handleSendReminder(student)}
                                                    disabled={sendingReminder === student.userId}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {sendingReminder === student.userId ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Bell className="w-3.5 h-3.5" />
                                                    )}
                                                    Hatırlatma Gönder
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    IBAN Girilmiş
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
