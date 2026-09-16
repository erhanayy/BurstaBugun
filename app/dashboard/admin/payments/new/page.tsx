import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { funds, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PaymentForm } from "./payment-form";

export default async function NewPaymentPage() {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        return <div>Yetkisiz erişim. Sadece yöneticiler manuel tahsilat girebilir.</div>;
    }

    // Get all EFT funds
    const eftFunds = await db.query.funds.findMany({
        where: and(
            eq(funds.tenantId, tenantData.tenantId),
            eq(funds.paymentMethod, 'wire_transfer'),
            eq(funds.isActive, true)
        ),
        orderBy: (f, { desc }) => [desc(f.createdAt)]
    });

    // Get all users for the dropdown
    const allUsers = await db.query.users.findMany({
        orderBy: (u, { asc }) => [asc(u.fullName)]
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Manuel Tahsilat (EFT/Havale) Girişi</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Vakıf hesabına gelen EFT veya Havale ödemelerini buradan ilgili fona işleyebilirsiniz.
                </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6 md:p-8">
                <PaymentForm eftFunds={eftFunds} users={allUsers} tenantId={tenantData.tenantId} />
            </div>
        </div>
    );
}
