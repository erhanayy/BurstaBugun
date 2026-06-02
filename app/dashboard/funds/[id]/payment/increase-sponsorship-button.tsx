"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { increaseFundSponsorship } from "@/lib/actions/funds";
import { Loader2, PlusCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function IncreaseSponsorshipButton({ fundId, unassignedCount }: { fundId: string, unassignedCount: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (unassignedCount <= 0) return null;

    const handleConfirm = async () => {
        const num = parseInt(count);
        if (isNaN(num) || num <= 0 || num > unassignedCount) return;

        setIsLoading(true);
        try {
            const result = await increaseFundSponsorship(fundId, num);
            if (result.success) {
                toast.success(`${num} yeni öğrenci zimmetinize eklendi. Ödeme planınız güncellendi.`);
                setIsOpen(false);
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "Öğrenci eklenirken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isOpen) {
        return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Kaç öğrenci daha desteklemek istiyorsunuz?
                </span>
                <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="w-24 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 h-8">
                        <SelectValue placeholder="1" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: unassignedCount }, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} Kişi</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-2">
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                        Onayla
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="h-8 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 rounded transition-colors flex items-center disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
        >
            <PlusCircle className="w-4 h-4" />
            Daha Fazla Öğrenci Destekle (Boşta {unassignedCount} öğrenci var)
        </button>
    );
}
