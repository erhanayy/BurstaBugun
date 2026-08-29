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
        <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                
                <div className="flex flex-col items-center bg-white dark:bg-zinc-950 px-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step === "1" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-emerald-500 bg-emerald-50 text-emerald-600"}`}>
                        {step === "1" ? "1" : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${step === "1" ? "text-blue-600" : "text-emerald-600"}`}>Fon Bilgileri</span>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-zinc-950 px-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step === "2" ? "border-blue-500 bg-blue-50 text-blue-600" : step === "3" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                        {step === "2" ? "2" : step === "3" ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${step === "2" ? "text-blue-600" : step === "3" ? "text-emerald-600" : "text-gray-400"}`}>Bursiyer Seçimi</span>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-zinc-950 px-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${step === "3" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                        3
                    </div>
                    <span className={`text-xs font-medium mt-2 ${step === "3" ? "text-blue-600" : "text-gray-400"}`}>Özet & Ödeme</span>
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
                <div className="relative">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-6xl mx-auto mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-blue-900">2. Adım: Bursiyer Seçimi</h3>
                            <p className="text-sm text-blue-800 mt-1">Fonunuz oluşturuldu! Şimdi havuzdan dilediğiniz öğrencileri fonunuza dahil edebilirsiniz. İşleminiz bitince aşağıdaki butona basarak ödemeye geçin.</p>
                        </div>
                    </div>
                    
                    <PoolPage searchParams={Promise.resolve({ fundId })} />

                    {/* Sticky Bottom Bar for Step 2 */}
                    <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex justify-center items-center">
                        <div className="max-w-6xl w-full flex justify-between items-center px-4">
                            <span className="text-sm text-gray-500 font-medium">Öğrenci seçiminiz bittiğinde ödeme adımına ilerleyebilirsiniz.</span>
                            <Link href={`/dashboard/fast-fund?step=3&fundId=${fundId}`}>
                                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-md">
                                    Ödemeye Geç <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {step === "3" && (
                <SummaryPage fundId={fundId} />
            )}
        </div>
    );
}
