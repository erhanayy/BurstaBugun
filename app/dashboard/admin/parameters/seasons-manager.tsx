"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus, Trash2, Power, AlertCircle, Loader2, Edit2 } from "lucide-react";
import { createSeason, toggleSeasonStatus, deleteSeason, updateSeason } from "@/lib/actions/seasons";
import { toast } from "sonner";

type Season = {
    id: string;
    period: string;
    isActive: boolean;
    appStartDate: Date | null;
    appEndDate: Date | null;
    fundStartDate: Date | null;
    fundEndDate: Date | null;
    sponsorPaymentStartDate: Date | null;
    sponsorPaymentEndDate: Date | null;
    studentPaymentStartDate: Date | null;
    studentPaymentEndDate: Date | null;
    seasonStartDate: Date | null;
    seasonEndDate: Date | null;
    defaultFundAmount: number | null;
    defaultFundDuration: number | null;
};

export function SeasonsManager({ seasons, globalPeriods = [] }: { seasons: Season[], globalPeriods?: string[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [period, setPeriod] = useState("");
    const [appStartDate, setAppStartDate] = useState("");
    const [appEndDate, setAppEndDate] = useState("");
    const [fundStartDate, setFundStartDate] = useState("");
    const [fundEndDate, setFundEndDate] = useState("");
    const [sponsorPaymentStartDate, setSponsorPaymentStartDate] = useState("");
    const [sponsorPaymentEndDate, setSponsorPaymentEndDate] = useState("");
    const [studentPaymentStartDate, setStudentPaymentStartDate] = useState("");
    const [studentPaymentEndDate, setStudentPaymentEndDate] = useState("");
    const [seasonStartDate, setSeasonStartDate] = useState("");
    const [seasonEndDate, setSeasonEndDate] = useState("");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("");

    const resetForm = () => {
        setPeriod(""); setAppStartDate(""); setAppEndDate(""); 
        setFundStartDate(""); setFundEndDate(""); 
        setSponsorPaymentStartDate(""); setSponsorPaymentEndDate("");
        setStudentPaymentStartDate(""); setStudentPaymentEndDate("");
        setSeasonStartDate(""); setSeasonEndDate("");
        setAmount(""); setDuration("");
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (s: Season) => {
        setEditingId(s.id);
        setPeriod(s.period);
        setAppStartDate(s.appStartDate ? format(new Date(s.appStartDate), "yyyy-MM-dd") : "");
        setAppEndDate(s.appEndDate ? format(new Date(s.appEndDate), "yyyy-MM-dd") : "");
        setFundStartDate(s.fundStartDate ? format(new Date(s.fundStartDate), "yyyy-MM-dd") : "");
        setFundEndDate(s.fundEndDate ? format(new Date(s.fundEndDate), "yyyy-MM-dd") : "");
        setSponsorPaymentStartDate(s.sponsorPaymentStartDate ? format(new Date(s.sponsorPaymentStartDate), "yyyy-MM-dd") : "");
        setSponsorPaymentEndDate(s.sponsorPaymentEndDate ? format(new Date(s.sponsorPaymentEndDate), "yyyy-MM-dd") : "");
        setStudentPaymentStartDate(s.studentPaymentStartDate ? format(new Date(s.studentPaymentStartDate), "yyyy-MM-dd") : "");
        setStudentPaymentEndDate(s.studentPaymentEndDate ? format(new Date(s.studentPaymentEndDate), "yyyy-MM-dd") : "");
        setSeasonStartDate(s.seasonStartDate ? format(new Date(s.seasonStartDate), "yyyy-MM-dd") : "");
        setSeasonEndDate(s.seasonEndDate ? format(new Date(s.seasonEndDate), "yyyy-MM-dd") : "");
        setAmount(s.defaultFundAmount ? s.defaultFundAmount.toString() : "");
        setDuration(s.defaultFundDuration ? s.defaultFundDuration.toString() : "");
        setIsCreating(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                period,
                appStartDate: appStartDate ? new Date(appStartDate) : null,
                appEndDate: appEndDate ? new Date(appEndDate) : null,
                fundStartDate: fundStartDate ? new Date(fundStartDate) : null,
                fundEndDate: fundEndDate ? new Date(fundEndDate) : null,
                sponsorPaymentStartDate: sponsorPaymentStartDate ? new Date(sponsorPaymentStartDate) : null,
                sponsorPaymentEndDate: sponsorPaymentEndDate ? new Date(sponsorPaymentEndDate) : null,
                studentPaymentStartDate: studentPaymentStartDate ? new Date(studentPaymentStartDate) : null,
                studentPaymentEndDate: studentPaymentEndDate ? new Date(studentPaymentEndDate) : null,
                seasonStartDate: seasonStartDate ? new Date(seasonStartDate) : null,
                seasonEndDate: seasonEndDate ? new Date(seasonEndDate) : null,
                defaultFundAmount: amount ? parseInt(amount) : null,
                defaultFundDuration: duration ? parseInt(duration) : null,
            };

            if (editingId) {
                await updateSeason(editingId, payload);
                toast.success("Sezon başarıyla güncellendi.");
            } else {
                await createSeason(payload);
                toast.success("Sezon başarıyla oluşturuldu.");
            }
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "İşlem başarısız oldu.");
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
                        Başvuru, fon ve ödeme dönemlerini buradan yönetebilirsiniz. Sadece aktif sezonlar dikkate alınır.
                    </p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => { resetForm(); setIsCreating(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Sezon Ekle
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleSave} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dönem (Period) *</label>
                            {editingId ? (
                                <input disabled value={period} className="w-full text-sm px-3 py-2 border rounded-lg bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 text-gray-500" />
                            ) : (
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
                            )}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Genel Dönem Tarihi</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={seasonStartDate} onChange={e => setSeasonStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={seasonEndDate} onChange={e => setSeasonEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Öğrenci Başvuru Tarihleri</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={appStartDate} onChange={e => setAppStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={appEndDate} onChange={e => setAppEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sponsor Fon Açma</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={fundStartDate} onChange={e => setFundStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={fundEndDate} onChange={e => setFundEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bursveren Ödeme Dönemi</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={sponsorPaymentStartDate} onChange={e => setSponsorPaymentStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={sponsorPaymentEndDate} onChange={e => setSponsorPaymentEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Öğrenci Ödeme Dönemi</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-gray-400">Başlangıç</label><input type="date" value={studentPaymentStartDate} onChange={e => setStudentPaymentStartDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                                <div><label className="text-[10px] text-gray-400">Bitiş</label><input type="date" value={studentPaymentEndDate} onChange={e => setStudentPaymentEndDate(e.target.value)} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-zinc-800 dark:border-zinc-700" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">İptal</button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-70">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Güncelle" : "Oluştur")}
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
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Genel Dönem:</strong> {s.seasonStartDate ? format(new Date(s.seasonStartDate), "dd.MM.yy") : "-"} / {s.seasonEndDate ? format(new Date(s.seasonEndDate), "dd.MM.yy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Başvuru:</strong> {s.appStartDate ? format(new Date(s.appStartDate), "dd.MM.yy") : "-"} / {s.appEndDate ? format(new Date(s.appEndDate), "dd.MM.yy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Fon:</strong> {s.fundStartDate ? format(new Date(s.fundStartDate), "dd.MM.yy") : "-"} / {s.fundEndDate ? format(new Date(s.fundEndDate), "dd.MM.yy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Sponsor Ödeme:</strong> {s.sponsorPaymentStartDate ? format(new Date(s.sponsorPaymentStartDate), "dd.MM.yy") : "-"} / {s.sponsorPaymentEndDate ? format(new Date(s.sponsorPaymentEndDate), "dd.MM.yy") : "-"}</span>
                                <span><strong className="font-medium text-gray-700 dark:text-gray-300">Öğrenci Ödeme:</strong> {s.studentPaymentStartDate ? format(new Date(s.studentPaymentStartDate), "dd.MM.yy") : "-"} / {s.studentPaymentEndDate ? format(new Date(s.studentPaymentEndDate), "dd.MM.yy") : "-"}</span>
                                <span className="w-full text-gray-400 mt-1"><strong className="font-medium text-gray-700 dark:text-gray-300">Standart Tutar:</strong> {s.defaultFundAmount ? `${s.defaultFundAmount} ₺` : "-"} ({s.defaultFundDuration ? `${s.defaultFundDuration} Ay` : "-"})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(s)} title="Düzenle" className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
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
