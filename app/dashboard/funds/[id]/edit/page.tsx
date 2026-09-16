import { db } from "@/lib/db";
import { funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { EditFundForm } from "./edit-form";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default async function EditFundPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const fundId = params.id;

    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId),
        with: { selections: true }
    });

    if (!fund) redirect("/dashboard/funds");

    const isOwner = fund.ownerId === tenantData.userId;
    const isAdmin = tenantData.userRole === 'admin' || tenantData.userRole === 'superadmin' || tenantData.isSuperAdmin;

    if (!isOwner && !isAdmin) {
        redirect("/dashboard/funds");
    }

    const minimumAllowedCount = fund.selections.length;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-blue-600" />
                        Fonu Güncelle
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Fon detaylarını ve kapasitesini güncelleyin.
                    </p>
                </div>
                <Link
                    href="/dashboard/funds"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    İptal Et
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
                <EditFundForm 
                    fundId={fund.id}
                    initialData={{
                        title: fund.title,
                        description: fund.description || "",
                        photoUrl: fund.photoUrl || "",
                        targetStudentCount: fund.targetStudentCount || 1,
                    }}
                    minimumAllowedCount={minimumAllowedCount}
                />
            </div>
        </div>
    );
}
