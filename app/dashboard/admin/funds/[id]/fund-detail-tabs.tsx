"use client";

import { useState } from "react";
import { Users, FileText, CreditCard, Mail, Phone, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface User {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
}

interface Application {
    id: string;
    firstName: string;
    lastName: string;
    tcNo: string;
    university: string;
    grade: string;
}

export default function FundDetailTabs({ 
    contributors, 
    invitations, 
    selections, 
    payments 
}: { 
    contributors: any[], 
    invitations: any[], 
    selections: any[], 
    payments: any[] 
}) {
    const [activeTab, setActiveTab] = useState<'contributors' | 'students' | 'payments'>('contributors');

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('contributors')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'contributors' 
                        ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                >
                    <Users className="w-4 h-4" /> Bursveren Bilgileri ({contributors.length})
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'students' 
                        ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                >
                    <FileText className="w-4 h-4" /> Eşleşen Öğrenciler ({selections.length})
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'payments' 
                        ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                >
                    <CreditCard className="w-4 h-4" /> Ödemeler ({payments.length})
                </button>
            </div>

            {/* Tabs Content */}
            <div className="p-0">
                {activeTab === 'contributors' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Bursveren Adı</th>
                                    <th className="px-6 py-4 font-medium">İletişim Bilgileri</th>
                                    <th className="px-6 py-4 font-medium text-center">Öğrenci Adedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {/* Onaylanmış Katılımcılar */}
                                {contributors.map(c => (
                                    <tr key={`c-${c.id}`} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{c.user?.fullName || "İsimsiz"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2"><Mail className="w-3 h-3"/> {c.user?.email}</div>
                                            <div className="flex items-center gap-2 mt-1"><Phone className="w-3 h-3"/> {c.user?.phone || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium">
                                            {c.studentCount}
                                        </td>
                                    </tr>
                                ))}
                                {contributors.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Bu fonda henüz bir bursveren bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Bursiyer Adı</th>
                                    <th className="px-6 py-4 font-medium">Eğitim Bilgisi</th>
                                    <th className="px-6 py-4 font-medium">Bağlanan Tutar</th>
                                    <th className="px-6 py-4 font-medium text-center">Sponsoru</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {selections.map(sel => (
                                    <tr key={sel.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {sel.application?.firstName} {sel.application?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">TC: {sel.application?.tcNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <div className="line-clamp-1">{sel.application?.university}</div>
                                            <div className="text-xs mt-0.5">{sel.application?.grade}. Sınıf</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-fbiad-blue">{sel.amount.toLocaleString('tr-TR')} ₺</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {sel.paymentType === 'monthly' ? "Aylık Ödeme" : "Tek Seferlik"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 px-3 py-1.5 rounded-md text-xs font-medium">
                                                {sel.sponsor?.fullName || "Genel Havuz"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {selections.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Bu fonla eşleşmiş bir öğrenci bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Tarih</th>
                                    <th className="px-6 py-4 font-medium">Öğrenci</th>
                                    <th className="px-6 py-4 font-medium">Tutar / Yöntem</th>
                                    <th className="px-6 py-4 font-medium text-center">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {payments.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            {format(new Date(p.createdAt), "dd MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {p.application?.firstName} {p.application?.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{p.amount.toLocaleString('tr-TR')} ₺</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {p.paymentMethod === 'wire_transfer' ? "Havale / EFT" : "Kredi Kartı"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.status === 'completed' ? (
                                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Başarılı</span>
                                            ) : p.status === 'pending' ? (
                                                <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold">Bekliyor</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Başarısız</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Bu fona ait henüz bir ödeme kaydı bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
