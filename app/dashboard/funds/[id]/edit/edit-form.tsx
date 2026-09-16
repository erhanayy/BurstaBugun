"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateFund } from "@/lib/actions/funds";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface EditFundFormProps {
    fundId: string;
    initialData: {
        title: string;
        description: string;
        photoUrl: string;
        targetStudentCount: number;
        shareMessage: string;
    };
    minimumAllowedCount: number;
}

export function EditFundForm({ fundId, initialData, minimumAllowedCount }: EditFundFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description);
    const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl);
    const [shareMessage, setShareMessage] = useState(initialData.shareMessage || "");
    const [targetStudentCount, setTargetStudentCount] = useState(initialData.targetStudentCount.toString());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const numCount = parseInt(targetStudentCount);
        if (isNaN(numCount)) {
            toast.error("Geçerli bir öğrenci sayısı giriniz.");
            return;
        }

        if (numCount < minimumAllowedCount) {
            toast.error(`Öğrenci sayısı ${minimumAllowedCount} değerinden küçük olamaz.`);
            return;
        }

        if (!title.trim()) {
            toast.error("Fon adı boş bırakılamaz.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateFund(fundId, {
                title,
                description,
                photoUrl,
                targetStudentCount: numCount,
                shareMessage
            });
            
            if (res.success) {
                toast.success("Fon başarıyla güncellendi.");
                router.push("/dashboard/funds");
            }
        } catch (error: any) {
            toast.error(error.message || "Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fon Adı
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fon Açıklaması
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                    placeholder="Fon hakkında detaylı bilgi..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fon Logosu (URL)
                </label>
                <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                    placeholder="https://ornek.com/logo.jpg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hedef Öğrenci Sayısı
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        min={minimumAllowedCount}
                        value={targetStudentCount}
                        onChange={(e) => setTargetStudentCount(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Bu fona atanmış mevcut öğrenci sayısının ({minimumAllowedCount}) altına düşülemez. Kapasiteyi istediğiniz kadar artırabilirsiniz.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Whatsapp Paylaşım Notu
                </label>
                <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                    placeholder="Örn: Fona katılmak isterseniz lütfen bana dönüş yapın."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Boş bırakırsanız sistem varsayılan mesajını kullanır.
                </p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </div>
        </form>
    );
}
