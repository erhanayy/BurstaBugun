import { getCurrentTenant } from "@/lib/tenant";
import { db } from "@/lib/db";
import { applications, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import BankForm from "./bank-form";

export const metadata = {
    title: "Banka Bilgilerim (IBAN)",
};

export default async function BankSettingsPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) {
        redirect("/auth/login");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!user) {
        redirect("/auth/login");
    }

    // Check if user is eligible (must have an application in 'pool' or 'active' state)
    const userApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenantData.userId),
            eq(applications.tenantId, tenantData.tenantId)
        )
    });

    const isEligible = userApplication && (userApplication.status === 'pool' || userApplication.status === 'active');

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Banka Bilgilerim</h1>
            <p className="text-gray-500 mb-6">
                Burs ödemelerinizin sorunsuz gerçekleşebilmesi için kendinize ait (veya yasal velinize ait) IBAN bilgisini giriniz.
            </p>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                {!isEligible ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm">
                        <p className="font-medium mb-1">Şu an IBAN girişi yapamazsınız.</p>
                        <p>Sadece değerlendirmeyi geçip havuza alınan veya bursiyer olmaya hak kazanan öğrenciler banka bilgilerini girebilir.</p>
                    </div>
                ) : (
                    <BankForm initialIban={user.iban || ""} initialIbanName={user.ibanName || ""} />
                )}
            </div>
        </div>
    );
}
