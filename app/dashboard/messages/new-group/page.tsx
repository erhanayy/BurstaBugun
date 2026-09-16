import { db } from "@/lib/db";
import { tenantUsers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";
import NewGroupForm from "./new-group-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Yeni Grup Oluştur",
};

export default async function NewGroupPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.role !== 'admin' && tenantData.role !== 'superadmin')) {
        redirect("/dashboard/messages");
    }

    // Sisteme kayıtlı tüm kullanıcıları çek
    const allUsers = await db.query.tenantUsers.findMany({
        where: eq(tenantUsers.tenantId, tenantData.tenantId),
        with: {
            user: true
        }
    });

    const userOptions = allUsers
        .filter(tu => tu.user)
        .map(tu => ({
            id: tu.userId,
            name: tu.user?.fullName || "Bilinmiyor",
            role: tu.role
        }));

    return (
        <div className="max-w-3xl mx-auto py-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/dashboard/messages" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Manuel Grup</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Sisteme kayıtlı kullanıcıları seçerek özel bir mesajlaşma grubu kurabilirsiniz.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                <NewGroupForm users={userOptions} />
            </div>
        </div>
    );
}
