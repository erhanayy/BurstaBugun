"use client";

import { useState } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { createSinglePaymentSession } from "@/lib/actions/payment-session";
import { toast } from "sonner";

export default function PaymentMethodButton({ paymentId, amount }: { paymentId: string; amount: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await createSinglePaymentSession(paymentId);

      if (res?.success && res.url) {
        // Web 3D Secure ödeme ekranına yönlendir
        window.location.href = res.url;
      } else {
        toast.error(res?.error || "Ödeme oturumu oluşturulamadı.");
        setIsLoading(false);
      }
    } catch (e: any) {
      toast.error(e?.message || "Bir bağlantı hatası oluştu.");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>Yeni Kart ile 3D Ödemeye Git ({amount.toLocaleString("tr-TR")} ₺)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
        </>
      )}
    </button>
  );
}
