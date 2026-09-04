import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { parametersTenantSeasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FundForm } from "../funds/new/fund-form";
import PoolPage from "../pool/page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SummaryPage from "./summary";

export default async function FastFundPage({ searchParams }: { searchParams: Promise<{ step?: string, fundId?: string }> }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const params = await searchParams;
    const step = params.step || "1";
    const fundId = params.fundId || "";

    const isAdmin = tenantData.userRole === 'admin';
    const seasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (s, { desc }) => [desc(s.createdAt)]
    });

    const Stepper = () => (
        <div className="max-w-xl mx-auto mb-12 mt-6">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#e2e8f0] -z-10"></div>
                
                {/* Step 1 */}
                <div className="flex flex-col items-center relative bg-transparent z-10 w-24">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step === "1" || step === "2" ? "bg-blue-600 text-white shadow-md border-0" : "bg-white text-gray-400 border-2 border-gray-200"}`}>
                        1
                    </div>
                    <span className={`text-[13px] font-semibold mt-3 text-center w-full ${step === "1" || step === "2" ? "text-blue-600" : "text-gray-400"}`}>Fon Bilgileri</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative bg-transparent z-10 w-24">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step === "2" ? "bg-blue-600 text-white shadow-md border-0" : "bg-white text-gray-400 border-2 border-gray-200"}`}>
                        2
                    </div>
                    <span className={`text-[13px] font-semibold mt-3 text-center w-full ${step === "2" ? "text-blue-600" : "text-gray-400"}`}>Özet & Ödeme</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full pb-24">
            <Stepper />

            {step === "1" && (
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6 md:p-8">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">1. Fon Bilgilerini Belirleyin</h2>
                        <p className="text-gray-500 mt-1">Öncelikle oluşturacağınız burs fonunun süresini ve bütçesini belirleyin.</p>
                    </div>
                    <FundForm 
                        seasons={seasons} 
                        isAdmin={isAdmin} 
                        onSuccessRedirect="/dashboard/fast-fund?step=2&fundId={fundId}" 
                    />
                </div>
            )}

            {step === "2" && (
                <SummaryPage fundId={fundId} />
            )}
        </div>
    );
}
