import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { parametersTenantSeasons } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PledgesClient } from "./pledges-client";
import { getPledges, getUnmatchedPayments } from "@/lib/actions/admin-pledges";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PledgesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole !== 'admin') {
        redirect('/dashboard/home');
    }

    // Await searchParams in Next.js 15
    const params = await searchParams;
    const selectedPeriodId = params?.period as string;

    // Fetch all active periods
    const periods = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (p, { desc }) => [desc(p.isActive), desc(p.createdAt)]
    });

    const activePeriod = selectedPeriodId 
        ? periods.find(p => p.id === selectedPeriodId)
        : periods.find(p => p.isActive) || periods[0];

    if (!activePeriod) {
        return (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <h2 className="text-xl font-semibold mb-2">Aktif Dönem Bulunamadı</h2>
                <p className="text-gray-500">Lütfen sistem parametrelerinden bir dönem ekleyip aktif hale getirin.</p>
            </div>
        );
    }

    // Fetch data for the active period
    const pledges = await getPledges(activePeriod.id);
    const unmatchedPayments = await getUnmatchedPayments(); // Unmatched payments are not strictly bound to a period conceptually but can be manually matched

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Burs Taahhütleri (Pledge CRM)</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Söz verilen taahhütleri ve sürpriz bağışları yönetin.
                    </p>
                </div>
            </div>

            <PledgesClient 
                periods={periods} 
                activePeriod={activePeriod} 
                initialPledges={pledges}
                unmatchedPayments={unmatchedPayments}
            />
        </div>
    );
}
