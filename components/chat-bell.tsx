"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { getMyRooms } from "@/lib/actions/chat";

export function ChatBell() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await getMyRooms();
                if (res.success && res.rooms) {
                    const count = (res.rooms as any[]).reduce((acc, room) => acc + (room.unreadCount || 0), 0);
                    setUnreadCount(count);
                }
            } catch (e) {
                // ignore
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 15000); // Check every 15s globally
        return () => clearInterval(interval);
    }, []);

    return (
        <Link href="/dashboard/messages" className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--header-bg)]"></span>
            )}
        </Link>
    );
}
