"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Season {
    id: string;
    period: string;
    isActive: boolean;
}

export function PeriodSelector({ seasons, currentPeriod, currentStatus }: { seasons: Season[], currentPeriod: string, currentStatus: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentStatus) {
            params.set('status', currentStatus);
        }
        if (e.target.value) {
            params.set('period', e.target.value);
        } else {
            params.delete('period');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            name="period"
            className="w-full px-2 py-2 bg-transparent border-0 text-sm font-medium focus:ring-0 dark:text-white cursor-pointer"
            defaultValue={currentPeriod}
            onChange={handleChange}
        >
            <option value="">Tüm Dönemler</option>
            {seasons.map(season => (
                <option key={season.id} value={season.id}>
                    {season.period} {season.isActive ? '(Aktif)' : ''}
                </option>
            ))}
        </select>
    );
}
