"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { createPaymentSession } from "@/lib/actions/payment-session";
import { toast } from "sonner";

export default function AppPaymentButton({ fundId }: { fundId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await createPaymentSession(fundId);

      if (res?.success && res.url) {
        // Redirect the user to the web app
        window.location.href = res.url;
      } else {
        toast.error(res?.error || "Ödeme yönlendirmesi başarısız oldu.");
        setIsLoading(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Bir hata oluştu.");
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      Tüm Kalan Taksitleri / Fonu Öde
    </button>
  );
}
