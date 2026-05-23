"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus, Trash2, Power, AlertCircle, Loader2 } from "lucide-react";
import { createSeason, toggleSeasonStatus, deleteSeason } from "@/lib/actions/seasons";
import { toast } from "sonner";

type Season = {
    id: string;
    period: string;
    isActive: boolean;
    appStartDate: Date | null;
    appEndDate: Date | null;
    fundStartDate: Date | null;
    fundEndDate: Date | null;
    defaultFundAmount: number | null;
    defaultFundDuration: number | null;
};

export function SeasonsManager({ seasons, globalPeriods = [] }: { seasons: Season[], globalPeriods?: string[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [period, setPeriod] = useState("");
    const [appStartDate, setAppStartDate] = useState("");
    const [appEndDate, setAppEndDate] = useState("");
    const [fundStartDate, setFundStartDate] = useState("");
    const [fundEndDate, setFundEndDate] = useState("");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createSeason({
                period,
                appStartDate: appStartDate ? new Date(appStartDate) : null,
                appEndDate: appEndDate ? new Date(appEndDate) : null,
                fundStartDate: fundStartDate ? new Date(fundStartDate) : null,
                fundEndDate: fundEndDate ? new Date(fundEndDate) : null,
                defaultFundAmount: amount ? parseInt(amount) : null,
                defaultFundDuration: duration ? parseInt(duration) : null,
            });
            toast.success("Sezon başarıyla oluşturuldu.");
            setIsCreating(false);
            // reset
            setPeriod(""); setAppStartDate(""); setAppEndDate(""); 
            setFundStartDate(""); setFundEndDate(""); setAmount(""); setDuration("");
        } catch (error: any) {
            toast.error(error.message || "Sezon oluşturulamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleSeasonStatus(id, !currentStatus);
            toast.success("Durum güncellendi.");
        } catch (error: any) {
            toast.error("Hata oluştu.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu sezonu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteSeason(id);
            toast.success("Sezon silindi.");
        } catch (error: any) {
            toast.error("Hata oluştu.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-blue-600" />
                        Eğitim Dönemleri (Sezonlar)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Başvuru ve fon tanımlama dönemlerini buradan yönetebilirsiniz. Sadece aktif sezonlar dikkate alınır.
                    </p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Sezon Ekle
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dönem (Period) *</label>
                            <select 
                                required 
                                value={period} 
                                onChange={e => setPeriod(e.target.value)} 
                                className="w-full text-sm px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Dönem Seçiniz...</option>
                                {globalPeriods.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Standart Tutar (₺)</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="2500" className="w-full text-sm px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Standart Süre (Ay)</label>
                                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="10" className="w-full text-sm px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Öğrenci Başvuru Tarihleri</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={appStartDate} onChange={e => setAppStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={appEndDate} onChange={e => setAppEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sponsor Fon Tarihleri</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={fundStartDate} onChange={e => setFundStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={fundEndDate} onChange={e => setFundEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">İptal</button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {seasons.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 text-gray-500">
                        Henüz hiç sezon tanımlanmamış.
                    </div>
                ) : seasons.map(s => (
                    <div key={s.id} className={`p-4 rounded-2xl border transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${s.isActive ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm' : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-800 opacity-60'}`}>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{s.period}</h3>
                                {s.isActive ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Aktif</span>
                                ) : (
                                    <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Pasif</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Başvuru:</strong> {s.appStartDate ? format(new Date(s.appStartDate), "dd.MM.yyyy") : "-"} / {s.appEndDate ? format(new Date(s.appEndDate), "dd.MM.yyyy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Fon:</strong> {s.fundStartDate ? format(new Date(s.fundStartDate), "dd.MM.yyyy") : "-"} / {s.fundEndDate ? format(new Date(s.fundEndDate), "dd.MM.yyyy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Standart:</strong> {s.defaultFundAmount ? `${s.defaultFundAmount} ₺` : "-"} ({s.defaultFundDuration ? `${s.defaultFundDuration} Ay` : "-"})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleToggle(s.id, s.isActive)} title={s.isActive ? "Pasife Al" : "Aktife Al"} className={`p-2 rounded-lg transition-colors ${s.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                <Power className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id)} title="Sil" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
