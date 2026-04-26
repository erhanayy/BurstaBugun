"use client";

import { useRouter } from "next/navigation";

export function PeriodFilter({ periods, currentPeriod }: { periods: string[], currentPeriod: string | null }) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dönem Seçimi:</span>
            <select
                className="form-select rounded-lg border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] transition-colors"
                value={currentPeriod || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    const sp = new URLSearchParams();
                    if (val) sp.set("period", val);
                    router.push(`/dashboard/home?${sp.toString()}`);
                }}
            >
                <option value="">Hepsi (Tüm Zamanlar)</option>
                {periods.map(p => (
                    <option key={p} value={p}>{p}</option>
                ))}
            </select>
        </div>
    );
}
