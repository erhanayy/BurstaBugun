"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateFund } from "@/lib/actions/funds";
import { toast } from "sonner";
import { Users, Globe, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface EditFundFormProps {
    fundId: string;
    initialData: {
        title: string;
        description: string;
        photoUrl: string;
        targetStudentCount: number;
        shareMessage: string;
        publishOnWebsite: boolean;
        showOwnerName: boolean;
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
    const [publishOnWebsite, setPublishOnWebsite] = useState(initialData.publishOnWebsite ?? true);
    const [showOwnerName, setShowOwnerName] = useState(initialData.showOwnerName ?? true);

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
                shareMessage,
                publishOnWebsite,
                showOwnerName
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
                    Fon Görseli / Kapak Fotoğrafı
                </label>
                <div className="flex flex-col gap-3">
                    {photoUrl && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                            <img src={photoUrl} alt="Fon Logosu" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setPhotoUrl("")}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md text-xs hover:bg-red-600 shadow-sm"
                                title="Fotoğrafı Kaldır"
                            >
                                Kaldır
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const loadingToast = toast.loading("Fotoğraf yükleniyor...");
                                const formData = new FormData();
                                formData.append("file", file);
                                try {
                                    const res = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: formData
                                    });
                                    const data = await res.json();
                                    toast.dismiss(loadingToast);
                                    if (data.url) {
                                        setPhotoUrl(data.url);
                                        toast.success("Fotoğraf başarıyla eklendi.");
                                    } else {
                                        toast.error(data.error || "Yükleme başarısız.");
                                    }
                                } catch (error) {
                                    toast.dismiss(loadingToast);
                                    toast.error("Dosya yüklenemedi.");
                                }
                            }
                        }}
                    />
                </div>
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

            {/* GÖRÜNÜRLÜK AYARLARI */}
            <div className="bg-gray-50/50 dark:bg-zinc-800/20 border border-gray-100 dark:border-zinc-800/50 p-5 rounded-2xl space-y-6">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-700 pb-3">
                    <Globe className="w-4 h-4" />
                    Web Sitesi Görünürlük Ayarları
                </h4>
                
                <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <label className="text-base text-gray-900 dark:text-gray-100 font-medium">Web Sitesinde Yayınla</label>
                        <p className="text-sm text-gray-500">
                            Bu fon FBİAD Vakfı web sitesindeki "Burslarımız" sayfasında görüntülensin mi?
                        </p>
                    </div>
                    <div>
                        <Switch
                            checked={publishOnWebsite}
                            onCheckedChange={setPublishOnWebsite}
                        />
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <label className="text-base text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            Fon Sahibi ve Katılımcı İsimlerini Göster
                        </label>
                        <p className="text-sm text-gray-500">
                            Fon web sitesinde yayınlanırken, fonu oluşturanın ve katılımcıların isimleri listelensin mi? Kapatırsanız gizli kalır.
                        </p>
                    </div>
                    <div>
                        <Switch
                            checked={showOwnerName}
                            onCheckedChange={setShowOwnerName}
                            disabled={!publishOnWebsite}
                        />
                    </div>
                </div>
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
