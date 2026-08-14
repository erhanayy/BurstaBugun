"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, XCircle, FileText, Loader2, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processExemption } from "@/lib/actions/reference";
import Link from "next/link";

export default function ExemptionsClient({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getInitials = (name?: string) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
    };

    const handleProcess = async (id: string, action: "approve" | "reject") => {
        let reason = "";
        
        if (action === "reject") {
            const userReason = window.prompt("Muafiyet reddi için bir sebep giriniz (Örn: 'Sistemimizde kaydınız bulunamadı', 'Evrak eksik'):");
            if (userReason === null) return; // User cancelled
            reason = userReason.trim();
        } else {
            if (!window.confirm("Bu muafiyet talebini ONAYLAMAK istediğinize emin misiniz?")) return;
        }

        setProcessingId(id);
        try {
            await processExemption(id, action, reason);
            toast.success(action === "approve" ? "Talep onaylandı ve öğrenci havuza alındı." : "Talep reddedildi, referans girmesi istendi.");
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error(err.message || "Bir hata oluştu.");
        } finally {
            setProcessingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Bekleyen Talep Yok</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Şu anda onayınızı bekleyen eski bursiyer muafiyet talebi bulunmamaktadır.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Öğrenci Adı Soyadı</th>
                            <th className="px-6 py-4 font-semibold">E-Posta / Tel</th>
                            <th className="px-6 py-4 font-semibold">Başvuru Formu</th>
                            <th className="px-6 py-4 font-semibold">Talep Tarihi</th>
                            <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                            {getInitials(req.user?.fullName)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {req.user?.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {/* TC is stored in dynamic form fields if needed */}
                                                TC: -
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900 dark:text-gray-300">{req.user?.email}</div>
                                    <div className="text-xs text-gray-500">{req.user?.phoneNumber}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        {req.form?.title || "Burs Başvuru Formu"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {format(new Date(req.updatedAt), "d MMMM yyyy HH:mm", { locale: tr })}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <Link href={`/dashboard/applications/${req.id}`}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            İncele
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleProcess(req.id, "reject")}
                                        disabled={processingId === req.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                                        Reddet
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleProcess(req.id, "approve")}
                                        disabled={processingId === req.id}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                                        Onayla
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
