'use client';

import { useState } from "react";
import { toggleTenantStatus } from "@/lib/actions/tenant";
import { useRouter } from "next/navigation";
import { Building, Trash2, CheckCircle2, XCircle, Globe, Palette } from "lucide-react";

export default function TenantClient({ initialTenants }: { initialTenants: any[] }) {
    const router = useRouter();

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleTenantStatus(id, !currentStatus);
            router.refresh();
        } catch (error) {
            alert("Durum güncellenirken hata oluştu.");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Tenant List */}
            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initialTenants.map(tenant => (
                        <div key={tenant.id} className={`pt-5 px-5 pb-16 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm relative overflow-hidden transition-colors ${tenant.isActive ? 'border-gray-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/30 opacity-75'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: tenant.primaryColor || '#2563EB' }}>
                                        {tenant.shortName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{tenant.shortName}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">{tenant.longName}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tenant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {tenant.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                {tenant.websiteUrl && (
                                    <div className="flex items-center text-xs text-gray-500 gap-1.5">
                                        <Globe className="w-3.5 h-3.5" />
                                        <a href={tenant.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">{tenant.websiteUrl}</a>
                                    </div>
                                )}
                                <div className="flex items-center text-xs text-gray-500 gap-1.5">
                                    <Palette className="w-3.5 h-3.5" />
                                    <span>Tema: {tenant.primaryColor || '#2563EB'}</span>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                                <button
                                    onClick={() => handleToggle(tenant.id, tenant.isActive)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${tenant.isActive ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                >
                                    {tenant.isActive ? <><XCircle className="w-4 h-4" /> Pasife Al</> : <><CheckCircle2 className="w-4 h-4" /> Aktifleştir</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
