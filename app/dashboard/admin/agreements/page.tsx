import { getAdminContracts } from "@/lib/actions/agreements";
import { CopyPlus, CheckCircle2, XCircle } from "lucide-react";
import { CreateContractForm } from "./create-form";

export default async function AdminAgreementsPage() {
    const contractsList = await getAdminContracts();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sözleşme Yönetimi</h1>
                <p className="text-gray-500">Sistemdeki sözleşmeleri güncelleyebilir, yeni versiyonlarını yayına alabilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-1 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm flex flex-col h-fit">
                    <h2 className="font-bold mb-4 flex items-center gap-2 border-b pb-2">
                        <CopyPlus className="w-5 h-5 text-indigo-500" />
                        Yeni Versiyon Ekle
                    </h2>
                    <CreateContractForm />
                </div>

                <div className="md:col-span-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 font-bold flex items-center justify-between">
                        Sözleşme Geçmişi
                    </div>
                    <div className="overflow-y-auto max-h-[600px] p-0">
                        {contractsList.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">Henüz hiçbir sözleşme eklenmemiş.</div>
                        ) : (
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400 border-b dark:border-zinc-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Tip</th>
                                        <th scope="col" className="px-4 py-3">Başlık (Versiyon)</th>
                                        <th scope="col" className="px-4 py-3">Tarih</th>
                                        <th scope="col" className="px-4 py-3 text-right">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contractsList.map((c) => (
                                        <tr key={c.id} className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {c.type}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="block font-semibold">{c.title}</span>
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">v{c.version}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="px-4 py-3 text-right flex justify-end">
                                                {c.isActive ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                                                        <CheckCircle2 className="w-3 h-3" /> Yayında
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                                                        <XCircle className="w-3 h-3" /> Eski
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
