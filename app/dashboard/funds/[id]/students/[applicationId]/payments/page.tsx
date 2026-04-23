import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applications, funds, payments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ArrowLeft, Wallet, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function StudentPaymentsPage({ params }: { params: { id: string, applicationId: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await params;

    const [fund, application, studentPayments] = await Promise.all([
        db.query.funds.findFirst({
            where: and(eq(funds.id, resolvedParams.id), eq(funds.tenantId, tenantData.tenantId))
        }),
        db.query.applications.findFirst({
            where: eq(applications.id, resolvedParams.applicationId),
            with: { user: true }
        }),
        db.query.payments.findMany({
            where: and(
                eq(payments.fundId, resolvedParams.id),
                eq(payments.applicationId, resolvedParams.applicationId)
            ),
            orderBy: [desc(payments.paymentDate), desc(payments.createdAt)],
        })
    ]);

    if (!fund || !application) return redirect("/dashboard/funds");

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Ödeme Geçmişi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex flex-col sm:flex-row gap-1">
                        <strong>{application.user?.fullName}</strong> adlı öğrenciye <strong>{fund.title}</strong> üzerinden yapılan ödemeler.
                    </p>
                </div>
                <Link href={`/dashboard/funds/${fund.id}/students`} className="inline-flex items-center px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Bursiyerlere Dön
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerçekleşen İşlemler</h2>
                        <p className="text-sm text-gray-500">Sistem tarafından onaylanmış banka transferleri ve işlem detayları</p>
                    </div>
                </div>

                {studentPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Henüz Ödeme Yapılmamış</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Bu öğrenciye ait sistem tarafından kaydedilmiş bir ödeme geçmişi bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {studentPayments.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">{payment.amount.toLocaleString('tr-TR')} ₺</span>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        {format(new Date(payment.paymentDate || payment.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                                    </div>
                                    {payment.notes && <p className="text-xs text-gray-400 mt-1">{payment.notes}</p>}
                                </div>
                                <div>
                                    {payment.status === 'completed' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                            Tamamlandı
                                        </span>
                                    ) : payment.status === 'failed' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Başarısız
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            Bekliyor
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
