"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface FundPeriodFilterProps {
    seasons: { id: string; period: string }[];
    currentPeriod: string;
}

export function FundPeriodFilter({ seasons, currentPeriod }: FundPeriodFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.set("period", "all");
        } else {
            params.set("period", value);
        }
        
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-400" />
            <Select value={currentPeriod} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <SelectValue placeholder="Dönem Seçin" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Dönemler</SelectItem>
                    {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                            {season.period}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
