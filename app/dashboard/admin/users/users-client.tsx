"use client";

import { useState } from "react";
import { Search, User, Mail, Phone, Calendar, Clock, ShieldCheck, FileText, CheckCircle2, UserCircle } from "lucide-react";

type UserData = {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
};

export default function UsersClient({ initialUsers }: { initialUsers: UserData[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Format dates to tr-TR
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Giriş Yok";
        return new Date(dateString).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Helper for role badging
    const getRoleDetails = (role: string) => {
        switch (role) {
            case 'admin': return { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: ShieldCheck };
            case 'sponsor': 
            case 'contributor': return { label: 'Bursveren', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 };
            case 'reference': return { label: 'Referans', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FileText };
            case 'applicant': return { label: 'Bursiyer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: UserCircle };
            default: return { label: 'Bilinmeyen', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: User };
        }
    };

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesRole = true;
        if (roleFilter !== "all") {
            if (roleFilter === "bursveren") {
                matchesRole = user.role === "sponsor" || user.role === "contributor";
            } else {
                matchesRole = user.role === roleFilter;
            }
        }

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            
            {/* Filters Area */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="İsim soyisim ile ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role Pills */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'applicant', label: 'Bursiyer' },
                        { id: 'bursveren', label: 'Bursveren' },
                        { id: 'reference', label: 'Referans' },
                        { id: 'admin', label: 'Admin' },
                    ].map(role => (
                        <button
                            key={role.id}
                            onClick={() => setRoleFilter(role.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                roleFilter === role.id 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {role.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Count */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Toplam <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> kullanıcı listeleniyor.
            </div>

            {/* User Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map(user => {
                        const roleInfo = getRoleDetails(user.role);
                        const RoleIcon = roleInfo.icon;
                        
                        return (
                            <div key={user.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                                
                                {/* Status Indicator */}
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} shadow-sm`} title={user.isActive ? 'Aktif' : 'Pasif'} />

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate" title={user.fullName}>
                                                {user.fullName}
                                            </h3>
                                            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {roleInfo.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-2 mb-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{user.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate" title={user.email || '-'}>{user.email || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 gap-2 text-xs">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Son: {formatDate(user.lastLoginAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h3>
                    <p className="text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun kayıt bulunamadı.</p>
                </div>
            )}

        </div>
    );
}
