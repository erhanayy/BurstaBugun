import { getMyRooms } from "@/lib/actions/chat";
import { getCurrentTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";
import ChatLayout from "./chat-layout";

export const metadata = {
    title: "Mesajlar",
};

export default async function MessagesPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/auth/login");

    const result = await getMyRooms();
    const rooms = result.success ? (result.rooms || []) : [];

    return (
        <div className="flex h-[calc(100vh-140px)] w-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <ChatLayout initialRooms={rooms as any} currentUserId={tenantData.userId} isAdmin={tenantData.role === 'admin' || tenantData.role === 'superadmin'} />
        </div>
    );
}
