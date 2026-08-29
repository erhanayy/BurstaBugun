"use client";

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
}

export default function DonationsTable({ donations }: { donations: Donation[] }) {
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
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    {item.status === 'completed' ? (
                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            Başarılı
                                        </span>
                                    ) : item.status === 'pending' ? (
                                        <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            Onay Bekliyor
                                        </span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            Başarısız
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        {item.paymentMethod === 'wire_transfer' ? (
                                            <span className="font-semibold text-xs text-fbiad-dark-blue">Havale / EFT</span>
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
        </div>
    );
}
