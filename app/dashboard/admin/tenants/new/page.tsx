import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewTenantClient from "./new-tenant-client";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewTenantPage() {
    const session = await auth();
    if (!session?.user?.isApplicationAdmin) {
        return redirect("/dashboard");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-blue-600" />
                        Yeni Vakıf (Tenant) Oluştur
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Sisteme yeni bir kurum / vakıf eklemek için aşağıdaki formu doldurun.
                    </p>
                </div>
                <Link href="/dashboard/admin/tenants" className="inline-flex items-center px-4 py-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Listeye Dön
                </Link>
            </div>

            <NewTenantClient />
        </div>
    );
}
