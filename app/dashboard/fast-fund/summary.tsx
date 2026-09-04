import { db } from "@/lib/db";
import { funds, fundSelections, applications, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getSystemParameter } from "@/lib/actions/parameters";
import AppPaymentButton from "../funds/[id]/payment/app-payment-button";

export default async function SummaryPage({ fundId }: { fundId: string }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    if (!fundId) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-red-200 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Fon Bulunamadı</h2>
                <p className="text-gray-500 mb-6">Geçersiz bir fon ID'si sağlandı.</p>
                <Link href="/dashboard/fast-fund">
                    <Button>Başa Dön</Button>
                </Link>
            </div>
        );
    }

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId)
    });

    if (!fund) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-red-200 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Fon Bulunamadı</h2>
                <p className="text-gray-500 mb-6">Aradığınız fon sistemde bulunamadı.</p>
                <Link href="/dashboard/fast-fund">
                    <Button>Başa Dön</Button>
                </Link>
            </div>
        );
    }

    // Decoupled architecture: We use targetStudentCount directly
    const studentCount = fund.targetStudentCount || 1;
    const totalMonthlyAmount = (fund.monthlyLimit || 0) * studentCount;
    const displayAmount = fund.paymentMethod === 'upfront' 
        ? totalMonthlyAmount * (fund.durationMonths || 1)
        : totalMonthlyAmount;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="text-blue-600" /> Bağış Özeti
                    </h2>
                    <p className="text-gray-500 mt-1">Fonunuz oluşturuldu ve öğrenci kapasiteniz belirlendi. Son bir kontrol yapıp ödeme adımına geçebilirsiniz.</p>
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Fon Detayları</h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                <div>
                                    <span className="text-xs text-gray-500 block">Fon Adı</span>
                                    <span className="font-semibold text-gray-900">{fund.title}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">Süre</span>
                                    <span className="font-medium text-gray-900">{fund.durationMonths} Ay</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">Ödeme Şekli</span>
                                    <span className="font-medium text-gray-900">{fund.paymentMethod === 'monthly' ? 'Aylık Düzenli' : 'Tek Seferlik'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Fon Kapasitesi</h3>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 flex items-start gap-3">
                                <Users className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">{studentCount} Öğrenci</p>
                                    {tenantData.userRole === 'admin' ? (
                                        <p>Havuzdaki uygun öğrencileri yönetim paneli üzerinden doğrudan bu fona atayabilirsiniz.</p>
                                    ) : (
                                        <p>
                                            Bağışınız vakıf yönetimi tarafından havuzdaki {studentCount} uygun öğrenciye burs olarak aktarılacaktır. Öğrenci atamaları sonradan yapılacaktır.
                                            {tenantData.canSponsorSelectFromPool && " Veya isterseniz siz de ödeme sonrası havuzdan öğrencilerinizi seçebilirsiniz."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-sm text-gray-500 font-medium block">Toplam {fund.paymentMethod === 'monthly' ? 'Aylık' : ''} Bağış Tutarı</span>
                            <span className="text-3xl font-bold text-gray-900">{displayAmount.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        
                        {displayAmount > 0 ? (
                            <div className="w-full md:w-auto scale-110 origin-right">
                                <AppPaymentButton fundId={fund.id} />
                            </div>
                        ) : (
                            <div className="text-red-500 font-medium text-sm">Geçerli bir tutar bulunamadı.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
