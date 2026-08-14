"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, Loader2, File } from "lucide-react";
import { recoverApplicationDocuments } from "@/lib/actions/application";

export default function RecoverClient({ applications }: { applications: any[] }) {
    const [selectedAppId, setSelectedAppId] = useState<string>(applications.length === 1 ? applications[0].id : "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // File states
    const [ogrenciBelgesi, setOgrenciBelgesi] = useState<File | null>(null);
    const [transkript, setTranskript] = useState<File | null>(null);
    const [sabikaKaydi, setSabikaKaydi] = useState<File | null>(null);

    const handleUploadToGCS = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Dosya yüklenirken bir hata oluştu.");
        }

        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedAppId) {
            toast.error("Lütfen bir başvuru seçiniz.");
            return;
        }

        if (!ogrenciBelgesi && !transkript && !sabikaKaydi) {
            toast.error("Lütfen en az bir belge yükleyiniz.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Belgeleriniz buluta yükleniyor, lütfen bekleyin...");

        try {
            let ogrenciBelgesiUrl;
            let transkriptUrl;
            let sabikaKaydiUrl;

            if (ogrenciBelgesi) ogrenciBelgesiUrl = await handleUploadToGCS(ogrenciBelgesi);
            if (transkript) transkriptUrl = await handleUploadToGCS(transkript);
            if (sabikaKaydi) sabikaKaydiUrl = await handleUploadToGCS(sabikaKaydi);

            await recoverApplicationDocuments(selectedAppId, {
                ogrenciBelgesi: ogrenciBelgesiUrl,
                transkript: transkriptUrl,
                sabikaKaydi: sabikaKaydiUrl
            });

            toast.dismiss(loadingToast);
            toast.success("Belgeleriniz başarıyla kaydedildi! Teşekkür ederiz.");
            
            // Clear inputs
            setOgrenciBelgesi(null);
            setTranskript(null);
            setSabikaKaydi(null);
            
            // Optionally, we could clear the file inputs visually
            const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
            fileInputs.forEach(input => input.value = '');

        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyiniz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <File className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aktif Başvuru Bulunamadı</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Sistemde size ait bir burs başvurusu bulunamadı. Lütfen "Burs Başvurusu Yap" menüsünden yeni bir başvuru oluşturunuz.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        İlgili Başvurunuz
                    </label>
                    <select
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                    >
                        <option value="">Seçiniz...</option>
                        {applications.map((app) => (
                            <option key={app.id} value={app.id}>
                                {app.form?.title || "Burs Başvurusu"} - {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
                        Yüklenecek Belgeler
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            1. Okul Öğrenci Belgesi <span className="text-xs text-gray-500 font-normal ml-2">(Sadece PDF veya Görsel)</span>
                        </label>
                        <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setOgrenciBelgesi(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            2. Okul Transkript Belgesi <span className="text-xs text-gray-500 font-normal ml-2">(Sadece PDF veya Görsel)</span>
                        </label>
                        <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setTranskript(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            3. Adli Sicil (Sabıka) Kaydı Çıktısı <span className="text-xs text-gray-500 font-normal ml-2">(Sadece PDF veya Görsel)</span>
                        </label>
                        <input 
                            type="file" 
                            accept=".pdf,image/*"
                            onChange={(e) => setSabikaKaydi(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting || (!ogrenciBelgesi && !transkript && !sabikaKaydi) || !selectedAppId}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Dosyalar Yükleniyor...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5 mr-2" />
                                Seçili Belgeleri Gönder ve Başvurumu Güncelle
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
