"use client";

import { useState } from "react";
import { setSystemParameter } from "@/lib/actions/parameters";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ParametersForm({ initialMaxLimit }: { initialMaxLimit: string }) {
    const [maxLimit, setMaxLimit] = useState(initialMaxLimit);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const router = useRouter();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await setSystemParameter("MAX_MONTHLY_LIMIT", maxLimit, "Öğrenci Başına Maksimum Aylık Kazanç Limiti (TL)");
            setMessage({ text: "Parametreler başarıyla güncellendi.", type: "success" });
            router.refresh();
        } catch (error: any) {
            setMessage({ text: error.message || "Kaydedilirken hata oluştu.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Aylık Burs Üst Limiti (TL)</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                        Bir öğrencinin havuzdaki bağışçılardan bir ay içinde toplayabileceği <u>maksimum toplam tutar</u> (Örn: 5000). Eğer öğrenci bu tutara ulaşmışsa, diğer sponsorlar onu fonlarına dahil edemez.
                    </p>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="100"
                            required
                            value={maxLimit}
                            onChange={(e) => setMaxLimit(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="5000"
                        />
                        <span className="absolute right-4 top-2.5 text-gray-500 font-medium">TL</span>
                    </div>
                </div>

                {/* Gelecekte eklenecek diğer parametreler için boşluk */}
                <div className="space-y-2 opacity-50 pointer-events-none">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Gelecek Parametre Eklenecek</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yeni parametre tipleri buraya eklenecektir.</p>
                    <input disabled type="text" className="w-full px-4 py-2 border border-dashed border-gray-300 bg-transparent rounded-lg" value="Rezerve" />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Parametreleri Kaydet
                </button>
            </div>
        </form>
    );
}
