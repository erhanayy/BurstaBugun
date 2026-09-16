"use client";

import { useState } from "react";
import { saveBankInfo } from "@/lib/actions/bank";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function BankForm({ initialIban, initialIbanName }: { initialIban: string, initialIbanName: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setStatus(null);
        
        try {
            const result = await saveBankInfo(formData);
            if (result.success) {
                setStatus({ success: true, message: result.message || 'Başarıyla kaydedildi.' });
            } else {
                setStatus({ success: false, message: result.error || 'Bir hata oluştu.' });
            }
        } catch (e) {
            setStatus({ success: false, message: 'Sunucu ile iletişim kurulamadı.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {status && (
                <div className={`p-4 rounded-lg flex items-start gap-3 text-sm ${status.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {status.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <div className="pt-0.5">{status.message}</div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="ibanName">Alıcı Adı Soyadı (Banka Hesabındaki İsim)</Label>
                <Input 
                    id="ibanName" 
                    name="ibanName" 
                    defaultValue={initialIbanName} 
                    placeholder="Örn: AHMET YILMAZ"
                    required 
                    className="uppercase"
                />
                <p className="text-xs text-gray-500">
                    Hesap sahibi bursiyerin kendisi olmalıdır. 18 yaşından küçükse velisinin hesabı olabilir.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="iban">IBAN Numarası</Label>
                <Input 
                    id="iban" 
                    name="iban" 
                    defaultValue={initialIban} 
                    placeholder="TR__ ____ ____ ____ ____ ____ __"
                    maxLength={32}
                    required 
                    className="font-mono text-lg tracking-wider"
                />
                <p className="text-xs text-gray-500">
                    TR ile başlayan 26 haneli IBAN numaranızı boşluklu veya boşluksuz girebilirsiniz.
                </p>
            </div>

            <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? 'Kaydediliyor...' : 'Bilgileri Kaydet / Güncelle'}
                </Button>
            </div>
        </form>
    );
}
