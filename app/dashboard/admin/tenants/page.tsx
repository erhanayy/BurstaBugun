import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import TenantClient from "./tenant-client";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export default async function TenantsPage() {
    const session = await auth();
    if (!session?.user?.isApplicationAdmin) {
        return redirect("/dashboard");
    }

    const allTenants = await db.select().from(tenants);

    return (
        <div className="max-w-6xl mx-auto space-y-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Vakıf (Tenant) Yönetimi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Sistemdeki tüm vakıfları görüntüleyin, erişimlerini yönetin ve yeni vakıflar oluşturun.
                    </p>
                </div>
                <Link href="/dashboard/admin/tenants/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
                    <Plus className="w-5 h-5 mr-1" />
                    Yeni Vakıf Ekle
                </Link>
            </div>

            <TenantClient initialTenants={allTenants} />
        </div>
    );
}
