"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { selectBursiyer } from "@/lib/actions/sponsor";
import { Check, Loader2 } from "lucide-react";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export function SelectionButton({ applicationId, fundId, defaultSelected = false }: { applicationId: string; fundId: string; defaultSelected?: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (defaultSelected) {
        return (
            <Button disabled variant="outline" className="w-full sm:w-auto text-green-600 border-green-200 bg-green-50">
                <Check className="mr-2 h-4 w-4" /> Seçildi
            </Button>
        );
    }

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await selectBursiyer(applicationId, fundId);
                toast.success("Bursiyer başarıyla seçildi.");
            } catch (error: any) {
                toast.error(error.message || "Bursiyer seçilirken bir hata oluştu.");
            }
        });
    };

    return (
        <>
            <Button
                onClick={() => {
                    if (!fundId) {
                        toast.error("Geçerli bir fon seçimi bulunamadı. Lütfen Fonlarım sayfasından Havuz'a tekrar tıklayınız.");
                        return;
                    }
                    setIsModalOpen(true);
                }}
                disabled={isPending}
                className="w-full sm:w-auto"
            >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bursiyeri Seç
            </Button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title="Bursiyer Seçimi"
                message="Bu bursiyeri desteklemek üzere seçmek istediğinize emin misiniz? Diğer sponsorlar bu adayı göremeyebilir."
                confirmText="Evet, Seç"
            />
        </>
    );
}
