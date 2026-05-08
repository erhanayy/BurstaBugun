'use client';

import { useState } from "react";
import { createTenant } from "@/lib/actions/tenant";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function NewTenantClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: "", type: "" });

        const formData = new FormData(e.currentTarget);
        const data = {
            shortName: formData.get("shortName") as string,
            longName: formData.get("longName") as string,
            primaryColor: formData.get("primaryColor") as string,
            websiteUrl: formData.get("websiteUrl") as string,
        };

        try {
            await createTenant(data);
            setMessage({ text: "Vakıf başarıyla oluşturuldu. Listeye yönlendiriliyorsunuz...", type: "success" });
            setTimeout(() => {
                router.push("/dashboard/admin/tenants");
                router.refresh();
            }, 1500);
        } catch (error: any) {
            setMessage({ text: error.message || "Bir hata oluştu", type: "error" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
                {message.text && (
                    <div className={`p-4 rounded-xl text-sm mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Kısa Ad (Marka)</label>
                            <input required name="shortName" type="text" placeholder="Örn: BurstaBugün" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            <p className="text-xs text-gray-500">Sistemde ve arayüzlerde görünecek kısa isim.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Uzun Ad (Resmi Kurum)</label>
                            <input required name="longName" type="text" placeholder="Örn: BurstaBugün Eğitim Vakfı" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            <p className="text-xs text-gray-500">Resmi evraklarda ve sözleşmelerde kullanılacak tam isim.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Tema Rengi (Hex)</label>
                            <div className="flex gap-3 items-center">
                                <input name="primaryColor" type="color" defaultValue="#2563EB" className="w-12 h-12 p-1 border border-gray-300 dark:border-zinc-700 rounded-xl bg-transparent cursor-pointer" />
                                <span className="text-xs text-gray-500">Vakfa özel arayüz (menü) rengi.</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 dark:text-white">Web Sitesi (Opsiyonel)</label>
                            <input name="websiteUrl" type="url" placeholder="https://..." className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            <p className="text-xs text-gray-500">Kurumun resmi web adresi.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                        <button disabled={isSubmitting} type="submit" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                            <Building2 className="w-5 h-5 mr-2" />
                            {isSubmitting ? "Oluşturuluyor..." : "Vakfı Oluştur ve Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
