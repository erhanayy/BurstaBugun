"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function SearchBar({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(defaultValue);

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set('q', value);
            } else {
                params.delete('q');
            }
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [value, router, pathname, searchParams]);

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${isPending ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <input
                type="text"
                placeholder="Ad Soyad ile bursiyer ara..."
                className="block w-full pl-10 pr-3 py-2 border-0 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm transition-colors dark:text-white"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}
