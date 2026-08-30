"use client";

import Link from "next/link";
import { ChevronRight, Users, Target } from "lucide-react";

interface Fund {
    id: string;
    title: string;
    ownerName: string;
    period: string;
    targetStudentCount: number;
    matchedStudentCount: number;
    isActive: boolean;
}

export default function FundsTable({ funds }: { funds: Fund[] }) {
    if (funds.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 text-center text-gray-500">
                Bu kriterlere uygun fon bulunamadı.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funds.map((fund) => {
                const progressPercentage = fund.targetStudentCount > 0 
                    ? Math.min(100, Math.round((fund.matchedStudentCount / fund.targetStudentCount) * 100))
                    : 0;
                
                return (
                    <div key={fund.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                    fund.isActive 
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                                    : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                                }`}>
                                    {fund.isActive ? "Aktif" : "Tamamlandı"}
                                </span>
                                <span className="text-xs text-gray-500 font-medium bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                    {fund.period}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">
                                {fund.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Kurucu: <span className="font-medium text-gray-700 dark:text-gray-300">{fund.ownerName}</span>
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Users className="w-4 h-4" /> Eşleşen
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {fund.matchedStudentCount} / {fund.targetStudentCount}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all" 
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-100 dark:border-zinc-800 p-4 bg-gray-50/50 dark:bg-zinc-800/20">
                            <Link 
                                href={`/dashboard/admin/funds/${fund.id}`}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Detayları Gör <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
