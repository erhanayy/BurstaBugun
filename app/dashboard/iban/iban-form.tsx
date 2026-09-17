"use client";

import { useState } from "react";
import { saveIban } from "@/lib/actions/student";
import { CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface IbanFormProps {
    initialIban?: string;
    initialIbanName?: string;
}

export function IbanForm({ initialIban, initialIbanName }: IbanFormProps) {
    const formatIban = (value: string) => {
        let val = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        if (val.length > 0 && !val.startsWith('TR')) {
            if (val.startsWith('T')) {
                if (val.length === 1) val = 'TR';
                else val = 'TR' + val.substring(1);
            } else {
                val = 'TR' + val;
            }
        }
        
        let formatted = '';
        for (let i = 0; i < val.length; i += 4) {
            if (i > 0) formatted += ' ';
            formatted += val.substring(i, i + 4);
        }
        return formatted.substring(0, 32);
    };

    const [iban, setIban] = useState(() => initialIban ? formatIban(initialIban) : "");
    const [ibanName, setIbanName] = useState(initialIbanName || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        const rawIban = iban.replace(/\s/g, '');
        const res = await saveIban(rawIban, ibanName);
        if (res.success) {
            setSuccess(true);
            router.refresh();
        } else {
            setError(res.error || "Bilinmeyen bir hata oluştu.");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Banka IBAN Bilgileriniz</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Burs ödemelerinizin yapılabilmesi için IBAN bilgilerinizi giriniz.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-start gap-2 text-sm border border-emerald-100">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>IBAN bilgileriniz başarıyla kaydedildi.</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad (Banka Hesabındaki)</label>
                    <input
                        type="text"
                        required
                        value={ibanName}
                        onChange={(e) => setIbanName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Örn: Ahmet Yılmaz"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN Numarası</label>
                    <input
                        type="text"
                        required
                        value={iban}
                        onChange={(e) => setIban(formatIban(e.target.value))}
                        onFocus={() => {
                            if (!iban) setIban("TR");
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white font-mono tracking-wide"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        maxLength={32}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Kaydediliyor...' : (initialIban ? 'Bilgileri Güncelle' : 'Bilgileri Kaydet')}
                    </button>
                </div>
            </div>
        </form>
    );
}
