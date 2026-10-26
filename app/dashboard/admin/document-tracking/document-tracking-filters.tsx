"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Calendar, FileText, CheckCircle2, Clock, X } from "lucide-react";
import { useTransition } from "react";

interface Season {
    id: string;
    period: string;
    isDefault?: boolean | null;
    isActive?: boolean | null;
}

interface DocDefinition {
    id: string;
    name: string;
    isPeriodic: boolean;
}

interface DocumentTrackingFiltersProps {
    seasons: Season[];
    definitions: DocDefinition[];
    currentPeriod: string;
    currentDocumentId: string;
    currentSearch: string;
    currentStatus: string;
}

export function DocumentTrackingFilters({
    seasons,
    definitions,
    currentPeriod,
    currentDocumentId,
    currentSearch,
    currentStatus,
}: DocumentTrackingFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get("q") as string;
        updateFilter("q", q ? q.trim() : "");
    };

    const clearSearch = () => {
        updateFilter("q", "");
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* 1. Dönem Seçici */}
                <div className="md:col-span-3">
                    <label htmlFor="filter-period" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Dönem Seçimi
                    </label>
                    <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            id="filter-period"
                            value={currentPeriod}
                            onChange={(e) => updateFilter("period", e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            {seasons.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.period} {s.isDefault ? "(Aktif Dönem)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 2. Doküman Filtresi */}
                <div className="md:col-span-3">
                    <label htmlFor="filter-doc" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Doküman Türü
                    </label>
                    <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            id="filter-doc"
                            value={currentDocumentId || "all"}
                            onChange={(e) => updateFilter("documentId", e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Tüm İmzalı Dokümanlar</option>
                            {definitions.map((def) => (
                                <option key={def.id} value={def.id}>
                                    {def.name} {def.isPeriodic ? "(Dönemlik)" : "(Genel)"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Ad Soyad / Arama Çubuğu */}
                <div className="md:col-span-4">
                    <label htmlFor="filter-search" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Bursiyer Ara (Ad Soyad)
                    </label>
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            id="filter-search"
                            name="q"
                            type="text"
                            defaultValue={currentSearch}
                            placeholder="Öğrenci adı, e-posta..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        {currentSearch && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* 4. Durum Filtresi */}
                <div className="md:col-span-2">
                    <label htmlFor="filter-status" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Teslim Durumu
                    </label>
                    <select
                        id="filter-status"
                        value={currentStatus || "all"}
                        onChange={(e) => updateFilter("status", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="all">Tümü</option>
                        <option value="received">Teslim Alındı</option>
                        <option value="pending">Bekliyor (Eksik)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
