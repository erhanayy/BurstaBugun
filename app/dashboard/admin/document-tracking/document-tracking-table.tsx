"use client";

import { useState, useTransition } from "react";
import { TrackingItem, toggleSignedDocumentSubmission } from "@/lib/actions/signed-documents";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, Clock, FileText, Download, Check, AlertCircle, Phone, Mail, Building } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface DocumentTrackingTableProps {
    initialItems: TrackingItem[];
    periodName: string;
}

export function DocumentTrackingTable({ initialItems, periodName }: DocumentTrackingTableProps) {
    const [items, setItems] = useState<TrackingItem[]>(initialItems);
    const [isPending, startTransition] = useTransition();

    // Optimistic toggle
    const handleToggle = async (item: TrackingItem) => {
        const nextState = !item.isReceived;

        // Anında yerel state'i güncelle (Optimistic UI)
        setItems(prev => prev.map(i => {
            if (i.id === item.id) {
                return {
                    ...i,
                    isReceived: nextState,
                    receivedAt: nextState ? new Date() : null,
                    receivedByAdminName: nextState ? "Siz" : null,
                };
            }
            return i;
        }));

        try {
            await toggleSignedDocumentSubmission({
                documentDefinitionId: item.definitionId,
                userId: item.userId,
                applicationId: item.applicationId,
                period: item.period,
                isReceived: nextState,
            });

            toast.success(
                nextState 
                    ? `${item.studentName} için "${item.documentName}" teslim alındı olarak işaretlendi.`
                    : `${item.studentName} için teslim işareti kaldırıldı.`
            );
        } catch (err: any) {
            // Hata olursa geri al (Rollback)
            setItems(prev => prev.map(i => {
                if (i.id === item.id) {
                    return item;
                }
                return i;
            }));
            toast.error(err.message || "İşlem sırasında bir hata oluştu.");
        }
    };

    // Excel Çıktısı Alma
    const exportToExcel = () => {
        if (items.length === 0) {
            toast.error("Dışa aktarılacak kayıt bulunmuyor.");
            return;
        }

        const dataToExport = items.map((item, index) => ({
            "Sıra": index + 1,
            "Bursiyer Adı Soyadı": item.studentName,
            "E-posta": item.studentEmail || "-",
            "Telefon": item.studentPhone || "-",
            "Burs Fonu": item.fundName,
            "Dönem": item.periodName,
            "Doküman Adı": item.documentName,
            "Doküman Türü": item.isPeriodic ? "Dönemlik" : "Tek Seferlik (Genel)",
            "Teslim Durumu": item.isReceived ? "Teslim Alındı" : "Eksik / Bekleniyor",
            "Teslim Tarihi": item.receivedAt ? format(new Date(item.receivedAt), "dd.MM.yyyy HH:mm", { locale: tr }) : "-",
            "Teslim Alan Yetkili": item.receivedByAdminName || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Imzali_Evrak_Takip");

        // Kolon genişlikleri
        worksheet["!cols"] = [
            { wch: 6 },
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 20 },
        ];

        const dateStr = format(new Date(), "yyyy-MM-dd");
        XLSX.writeFile(workbook, `Imzali_Evrak_Takip_Listesi_${dateStr}.xlsx`);
        toast.success("Excel dosyası başarıyla indirildi.");
    };

    const totalCount = items.length;
    const receivedCount = items.filter(i => i.isReceived).length;
    const pendingCount = items.filter(i => !i.isReceived).length;

    return (
        <div className="space-y-4">
            {/* Üst İstatistik ve Excel Çıkartma Çubuğu */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>Toplam:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Teslim Alınan:</span>
                        <span className="font-bold">{receivedCount}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Bekleyen:</span>
                        <span className="font-bold">{pendingCount}</span>
                    </div>
                </div>

                <button
                    onClick={exportToExcel}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    <span>Excel'e Aktar</span>
                </button>
            </div>

            {/* Seçenek B: Dikey Liste Tablosu */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                            Filtrelere uygun bursiyer evrak kaydı bulunamadı.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Fona seçilmiş bir öğrenci veya tanımlı imzalı doküman bulunmuyor olabilir.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50/75 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-3.5 w-12 text-center">#</th>
                                    <th className="px-6 py-3.5">Bursiyer</th>
                                    <th className="px-6 py-3.5">Fon Bilgisi</th>
                                    <th className="px-6 py-3.5">İstenen Doküman</th>
                                    <th className="px-6 py-3.5 text-center">Teslim Kontrolü (Check)</th>
                                    <th className="px-6 py-3.5">Teslim Bilgisi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {items.map((item, idx) => (
                                    <tr 
                                        key={item.id} 
                                        className={`transition-colors ${
                                            item.isReceived 
                                                ? 'bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20' 
                                                : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
                                        }`}
                                    >
                                        {/* Sıra No */}
                                        <td className="px-6 py-4 text-center font-mono text-xs text-gray-400">
                                            {idx + 1}
                                        </td>

                                        {/* Bursiyer Bilgileri */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {item.studentName}
                                            </div>
                                            <div className="flex flex-col gap-0.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {item.studentEmail && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span>{item.studentEmail}</span>
                                                    </span>
                                                )}
                                                {item.studentPhone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span>{item.studentPhone}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Fon ve Dönem */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                                                <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                <span className="truncate max-w-[200px]" title={item.fundName}>{item.fundName}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {item.periodName}
                                            </div>
                                        </td>

                                        {/* Doküman Adı ve Kapsamı */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                                <span>{item.documentName}</span>
                                            </div>
                                            <div className="mt-1">
                                                {item.isPeriodic ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                        Dönemlik
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                        Tek Seferlik
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Checkbox (Teslim Durumu) */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(item)}
                                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                                    item.isReceived
                                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                                                        : 'bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700'
                                                }`}
                                                title={item.isReceived ? "Teslim işaretini kaldır" : "Teslim alındı olarak işaretle"}
                                            >
                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                                    item.isReceived 
                                                        ? 'bg-white border-white text-emerald-600' 
                                                        : 'border-gray-400 dark:border-zinc-500'
                                                }`}>
                                                    {item.isReceived && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                                <span>{item.isReceived ? "Teslim Alındı" : "Teslim Bekleniyor"}</span>
                                            </button>
                                        </td>

                                        {/* Teslim Tarihi / İşleyen */}
                                        <td className="px-6 py-4 text-xs">
                                            {item.isReceived ? (
                                                <div className="space-y-0.5">
                                                    <div className="font-medium text-emerald-700 dark:text-emerald-400">
                                                        {item.receivedAt ? format(new Date(item.receivedAt), "dd MMMM yyyy HH:mm", { locale: tr }) : "Tarih kaydedildi"}
                                                    </div>
                                                    {item.receivedByAdminName && (
                                                        <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                                                            İşleyen: {item.receivedByAdminName}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-zinc-600 italic">
                                                    Henüz teslim edilmedi
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
