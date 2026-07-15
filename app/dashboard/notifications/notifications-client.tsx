"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, CreditCard, FileText, CheckSquare, Info, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { markAllNotificationsAsRead } from "@/lib/actions/notification";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const getIcon = (type: string) => {
    switch (type) {
        case 'payment': return <CreditCard className="w-5 h-5 text-emerald-600" />;
        case 'application': return <FileText className="w-5 h-5 text-blue-600" />;
        case 'reference': return <CheckSquare className="w-5 h-5 text-purple-600" />;
        default: return <Info className="w-5 h-5 text-gray-600" />;
    }
};

const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50 dark:bg-zinc-900";
    
    switch (type) {
        case 'payment': return "bg-emerald-50 dark:bg-emerald-900/10";
        case 'application': return "bg-blue-50 dark:bg-blue-900/10";
        case 'reference': return "bg-purple-50 dark:bg-purple-900/10";
        default: return "bg-gray-50 dark:bg-zinc-800/50";
    }
};

export default function NotificationsClient({ initialData, tenantId, userId }: { initialData: any[], tenantId: string, userId: string }) {
    const [notifications, setNotifications] = useState(initialData);
    const [isMarking, setIsMarking] = useState(false);

    const hasUnread = notifications.some(n => !n.isRead);

    const handleMarkAllRead = async () => {
        setIsMarking(true);
        try {
            await markAllNotificationsAsRead(tenantId, userId);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success("Tüm bildirimler okundu olarak işaretlendi.");
        } catch (error) {
            toast.error("Bir hata oluştu.");
        } finally {
            setIsMarking(false);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-800 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Bildirim Yok</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Şu anda hesabınıza tanımlı herhangi bir bildirim bulunmamaktadır.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {hasUnread && (
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex justify-end">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleMarkAllRead} 
                        disabled={isMarking}
                        className="text-xs text-gray-600 dark:text-gray-300"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Tümünü Okundu İşaretle
                    </Button>
                </div>
            )}

            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {notifications.map((n) => {
                    const content = (
                        <div className={`p-5 flex gap-4 transition-colors ${getBgColor(n.type, n.isRead)} hover:bg-gray-100 dark:hover:bg-zinc-800`}>
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                                    {getIcon(n.type)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className={`text-sm font-semibold truncate ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {format(new Date(n.createdAt), "d MMM HH:mm", { locale: tr })}
                                    </span>
                                </div>
                                <p className={`text-sm ${n.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                                    {n.body}
                                </p>
                            </div>
                            {!n.isRead && (
                                <div className="flex-shrink-0 flex items-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    );

                    return n.actionUrl ? (
                        <Link key={n.id} href={n.actionUrl} className="block">
                            {content}
                        </Link>
                    ) : (
                        <div key={n.id}>
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
