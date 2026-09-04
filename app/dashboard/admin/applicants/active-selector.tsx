"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ActiveSelector({ activeStatus, currentStatus, currentPeriod }: { activeStatus: string, currentStatus: string, currentPeriod: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentStatus) {
            params.set('status', currentStatus);
        }
        if (currentPeriod) {
            params.set('period', currentPeriod);
        }
        if (e.target.value) {
            params.set('active', e.target.value);
        } else {
            params.delete('active');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            name="active"
            className="w-full px-2 py-2 bg-transparent border-0 text-sm font-medium focus:ring-0 dark:text-white cursor-pointer"
            defaultValue={activeStatus}
            onChange={handleChange}
        >
            <option value="active">Sadece Aktifleri Göster</option>
            <option value="inactive">Pasifleri Göster</option>
            <option value="all">Hepsini Göster</option>
        </select>
    );
}
