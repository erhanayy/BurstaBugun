"use client";

import { useRouter } from "next/navigation";

export function FundSelector({ funds, currentFundId }: { funds: any[], currentFundId: string }) {
    const router = useRouter();

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50 dark:bg-zinc-800/80 p-4 rounded-xl border border-blue-100 dark:border-zinc-700 w-full mb-6">
            <span className="text-sm font-semibold text-blue-900 dark:text-gray-200 shrink-0">Havuza Eklenecek Hedef Fon:</span>
            <select
                className="w-full sm:max-w-md h-10 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={currentFundId}
                onChange={(e) => {
                    const newId = e.target.value;
                    if (newId) {
                        router.push(`/dashboard/pool?fundId=${newId}`);
                    }
                }}
            >
                {!currentFundId && <option value="">--- İşlem Yapacağınız Fonu Seçin ---</option>}
                {funds.map((f: any) => {
                    const capacity = f.targetStudentCount !== null ? f.targetStudentCount : Infinity;
                    const filled = f.selections?.length || 0;
                    const isFull = capacity !== Infinity && filled >= capacity;

                    return (
                        <option key={f.id} value={f.id} disabled={isFull}>
                            {f.title} - {isFull ? `Dolu (${filled}/${capacity})` : (capacity === Infinity ? `Kapasite: ${filled} / Sınırsız` : `Kapasite: ${filled} / ${capacity}`)}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}
