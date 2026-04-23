"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Check, Loader2 } from "lucide-react";
import { saveIban } from "@/lib/actions/student";

export default function IbanForm({ initialIban, initialIbanName }: { initialIban: string, initialIbanName: string }) {
    const [iban, setIban] = useState(initialIban);
    const [ibanName, setIbanName] = useState(initialIbanName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await saveIban(iban, ibanName);
            if (res.success) {
                toast.success("IBAN bilginiz başarıyla güncellendi.");
            } else {
                toast.error(res.error || "Bir hata oluştu.");
            }
        } catch (e: any) {
            toast.error(e.message || "Bilinmeyen bir hata oluştu.");
        }
        setIsSaving(false);
    };

    const isIbanValid = iban.replace(/\s+/g, '').length >= 24;

    return (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">Banka Hesap Bilgileriniz</h2>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300">Ödemelerinizin yapılacağı hesabı belirleyin.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={ibanName}
                        onChange={(e) => setIbanName(e.target.value)}
                        placeholder="Hesap Sahibi Adı Soyadı (örn. Ayşe Yılmaz)"
                        className="text-sm bg-white dark:bg-zinc-900 sm:w-1/3"
                        maxLength={150}
                    />
                    <Input
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className="font-mono text-sm bg-white dark:bg-zinc-900 uppercase flex-1"
                        maxLength={32}
                    />
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !iban || !ibanName}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        {initialIban ? "Güncelle" : "Kaydet"}
                    </Button>
                </div>
            </div>
            {!isIbanValid && iban.length > 0 && (
                <p className="text-xs text-red-500 mt-2">Lütfen geçerli uzunlukta bir IBAN giriniz.</p>
            )}
        </div>
    );
}
