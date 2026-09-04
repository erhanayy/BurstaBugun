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
    fund,
    contributors, 
    invitations, 
    selections, 
    payments,
    studentPayments 
}: { 
    fund?: any,
    contributors: any[], 
    invitations: any[], 
    selections: any[], 
    payments: any[],
    studentPayments?: any[]
}) {
    const [activeTab, setActiveTab] = useState<'contributors' | 'students' | 'payments'>('contributors');

    return (
        <div className="space-y-6">
            {/* Table 1: Contributors */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Users className="w-4 h-4 text-blue-600" /> Bursveren Bilgileri ({contributors.length})
                </div>
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
            </div>

            {/* Table 2: Bursveren Ödeme Bilgileri */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Bursveren Ödeme Bilgileri ({payments.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bursveren Adı</th>
                                <th className="px-6 py-4 font-medium">Ödeme Tipi</th>
                                <th className="px-6 py-4 font-medium">Ödeme Şekli</th>
                                <th className="px-6 py-4 font-medium">Ödeme Tarihi</th>
                                <th className="px-6 py-4 font-medium">Tutar</th>
                                <th className="px-6 py-4 font-medium text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {payments.map(p => {
                                const displayDate = p.paymentDate ? new Date(p.paymentDate) : new Date(p.createdAt);
                                const isUpfront = fund?.paymentMethod === 'upfront';
                                const methodText = p.paymentMethod === 'wire_transfer' ? 'Havale/EFT' : 'Kredi Kartı';
                                
                                return (
                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {p.user?.fullName || "Bilinmeyen Bursveren"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                        {isUpfront ? "Peşin" : "Taksitli"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                        {methodText}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                        <div className="font-medium">{format(displayDate, "dd MMMM yyyy", { locale: tr })}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600 dark:text-blue-400">{p.amount.toLocaleString('tr-TR')} ₺</div>
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
                                );
                            })}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Bu fona ait henüz bir ödeme kaydı bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table 3: Students */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <FileText className="w-4 h-4 text-blue-600" /> Eşleşen Öğrenciler ({selections.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bursiyer Adı</th>
                                <th className="px-6 py-4 font-medium text-center">Sponsoru</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {selections.map(sel => (
                                <tr key={sel.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {sel.application?.user?.fullName || "İsimsiz Bursiyer"}
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
                                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">Bu fonla eşleşmiş bir öğrenci bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table 4: Student Payments */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <FileText className="w-4 h-4 text-green-600" /> Bursiyer Ödemeleri ({studentPayments?.length || 0})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Bursiyer Adı</th>
                                <th className="px-6 py-4 font-medium">Ödeme Tarihi</th>
                                <th className="px-6 py-4 font-medium">Tutar</th>
                                <th className="px-6 py-4 font-medium">Açıklama</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {studentPayments?.map(sp => (
                                <tr key={sp.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {sp.application?.user?.fullName || "İsimsiz Bursiyer"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-medium">
                                        {format(new Date(sp.paymentDate), "dd MMMM yyyy", { locale: tr })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-green-600 dark:text-green-400">{sp.amount.toLocaleString('tr-TR')} ₺</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {sp.notes || "-"}
                                    </td>
                                </tr>
                            ))}
                            {(!studentPayments || studentPayments.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Henüz Bursiyerlere Bir Ödeme Yapılmamıştır.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
