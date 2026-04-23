"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Clock } from "lucide-react";

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isHistory = pathname.includes("/history");
    const isUpcoming = pathname.includes("/upcoming");

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Ödeme Sayfası</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Sistemdeki geçmiş ödemeleri ve ödemesi yaklaşan bursiyerleri yönetin.
                </p>
            </div>

            <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
                <Link
                    href="/dashboard/payments/history"
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isHistory
                            ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <Wallet className="w-4 h-4" /> Geçmiş Ödemeler
                </Link>
                <Link
                    href="/dashboard/payments/upcoming"
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${isUpcoming
                            ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    <Clock className="w-4 h-4" /> Ödemesi Gelenler
                </Link>
            </div>

            {children}
        </div>
    );
}
