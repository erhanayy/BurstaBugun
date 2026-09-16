"use client";

import { useState } from "react";
import { updateDonationStatus } from "@/lib/actions/donations";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Donation {
    id: string;
    donorName: string;
    donorTc: string;
    donorEmail: string;
    donorPhone: string;
    amount: number;
    isAnonymous: boolean;
    isFbiadMember: boolean;
    wantsMembershipInfo: boolean;
    status: string;
    paymentMethod: string;
    receiptUrl: string | null;
    bankTransactionId: string;
    dateString: string;
    fundId?: string | null;
    fundName?: string;
}

export default function DonationsTable({ donations, eftFunds = [] }: { donations: Donation[], eftFunds?: any[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [selectedFundId, setSelectedFundId] = useState("");
    const [supporterType, setSupporterType] = useState("recurring");
    
    // Using import for the server action at the top
    const { assignDonationToFund } = require("@/lib/actions/donations");

    const handleAction = async (id: string, status: 'completed' | 'failed') => {
        if (status === 'failed' && !window.confirm("Bu işlemi reddetmek istediğinize emin misiniz?")) return;
        if (status === 'completed' && !window.confirm("Bu ödemenin hesaba geçtiğini onaylıyor musunuz?")) return;

        setProcessingId(id);
        const res = await updateDonationStatus(id, status);
        if (res.success) {
            toast.success(status === 'completed' ? "İşlem onaylandı." : "İşlem reddedildi.");
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setProcessingId(null);
    };

    const handleAssignFund = async () => {
        if (!selectedDonation || !selectedFundId) return;
        
        setProcessingId("assigning_" + selectedDonation.id);
        const res = await assignDonationToFund(selectedDonation.id, selectedFundId, supporterType);
        
        if (res.success) {
            toast.success("Bağış başarıyla fona atandı.");
            setAssignModalOpen(false);
            setSelectedDonation(null);
            setSelectedFundId("");
            setSupporterType("recurring");
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setProcessingId(null);
    };

    if (donations.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 text-center text-gray-500">
                Bu kriterlere uygun bağış kaydı bulunamadı.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-4 py-3 font-medium">Tarih</th>
                            <th className="px-4 py-3 font-medium">Bağışçı Bilgisi</th>
                            <th className="px-4 py-3 font-medium">İletişim</th>
                            <th className="px-4 py-3 font-medium text-right">Tutar</th>
                            <th className="px-4 py-3 font-medium text-center">Bağlı Fon</th>
                            <th className="px-4 py-3 font-medium text-center">İşlem Durumu</th>
                            <th className="px-4 py-3 font-medium text-right">Ödeme Tipi & Dekont</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {donations.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {item.dateString}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                                        {item.donorName}
                                        {item.isAnonymous && (
                                            <span className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-gray-200 dark:border-zinc-700 whitespace-nowrap">
                                                Gizli İstek
                                            </span>
                                        )}
                                        {item.isFbiadMember && (
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                                                Dernek Üyesi
                                            </span>
                                        )}
                                        {item.wantsMembershipInfo && (
                                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-purple-200 dark:border-purple-800 whitespace-nowrap">
                                                Bilgi İstiyor
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        TC: {item.donorTc}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-gray-900 dark:text-gray-300">{item.donorEmail}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{item.donorPhone}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100 text-right">
                                    {item.amount.toLocaleString('tr-TR')} ₺
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.fundId ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-semibold text-fbiad-dark-blue">{item.fundName}</span>
                                            <span className="text-[10px] text-gray-500">Atandı</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedDonation(item);
                                                setSelectedFundId("");
                                                setAssignModalOpen(true);
                                            }}
                                            className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:bg-zinc-800 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                        >
                                            Fona Ata
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    {item.status === 'completed' ? (
                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            Başarılı
                                        </span>
                                    ) : item.status === 'pending' ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                Onay Bekliyor
                                            </span>
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() => handleAction(item.id, 'completed')}
                                                    disabled={processingId === item.id}
                                                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                                    title="Onayla"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'failed')}
                                                    disabled={processingId === item.id}
                                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title="Reddet"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            Başarısız
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        {item.paymentMethod === 'wire_transfer' ? (
                                            <span className="font-semibold text-xs text-fbiad-dark-blue">Vakıf Hesabına EFT/Havale</span>
                                        ) : (
                                            <span className="font-semibold text-xs text-gray-600">Kredi Kartı</span>
                                        )}
                                        
                                        {item.paymentMethod === 'wire_transfer' && item.receiptUrl && (
                                            <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline">
                                                Dekontu Gör
                                            </a>
                                        )}
                                        {item.paymentMethod === 'credit_card' && (
                                            <span className="font-mono text-xs text-gray-500">{item.bankTransactionId}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Fund Assignment Modal */}
            {assignModalOpen && selectedDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Fona Ata</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <strong className="text-gray-900 dark:text-gray-200">{selectedDonation.donorName}</strong> tarafından yapılan <strong className="text-gray-900 dark:text-gray-200">{selectedDonation.amount.toLocaleString('tr-TR')} ₺</strong> tutarındaki bağışı bir fona atıyorsunuz.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Hedef Fon <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedFundId}
                                        onChange={(e) => setSelectedFundId(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Lütfen bir fon seçiniz...</option>
                                        {eftFunds?.map((fund: any) => (
                                            <option key={fund.id} value={fund.id}>
                                                {fund.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Destekçi Tipi <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={supporterType}
                                        onChange={(e) => setSupporterType(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="recurring">Daimi Destekçi</option>
                                        <option value="one_time">Tek Seferlik Destekçi</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setAssignModalOpen(false);
                                    setSelectedDonation(null);
                                    setSelectedFundId("");
                                }}
                                disabled={processingId?.startsWith("assigning")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAssignFund}
                                disabled={!selectedFundId || processingId?.startsWith("assigning")}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processingId?.startsWith("assigning") ? (
                                    <>Atanıyor...</>
                                ) : (
                                    <>Fona Ata</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
