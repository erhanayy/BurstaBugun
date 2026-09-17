import { db } from "@/lib/db";
import { users, applications } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { IbanForm } from "./iban-form";
import { CreditCard } from "lucide-react";

export default async function IbanPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!currentUser) redirect("/login");

    const activeApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, currentUser.id),
            eq(applications.tenantId, tenantData.tenantId),
            or(
                eq(applications.status, 'selected'),
                eq(applications.status, 'active')
            )
        )
    });

    if (!activeApplication) {
        // Eğer seçili bir öğrenci değilse ana sayfaya yönlendir
        redirect("/dashboard/home");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">IBAN Bilgileri</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Burs ödemelerinizin yapılabilmesi için banka hesap bilgilerinizi yönetin.
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <IbanForm 
                    initialIban={currentUser.iban || ""} 
                    initialIbanName={currentUser.ibanName || currentUser.fullName} 
                />
            </div>
        </div>
    );
}
