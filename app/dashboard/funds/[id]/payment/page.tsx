import { db } from "@/lib/db";
import { funds, payments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, CheckCircle2, Clock, Users } from "lucide-react";
import { tr } from "date-fns/locale";
import { format } from "date-fns";

export default async function FundPaymentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const fundId = params.id;

    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId),
    });

    if (!fund) redirect("/dashboard");

    // Fetch payments assigned to this schedule
    const fundPayments = await db.query.payments.findMany({
        where: eq(payments.fundId, fundId),
        with: {
            application: {
                with: {
                    user: true
                }
            }
        },
        orderBy: [asc(payments.paymentDate)]
    });

    const isFullyPaid = fundPayments.length > 0 && fundPayments.every(p => p.status === 'completed');
    const totalPayments = fundPayments.length;
    const paidPayments = fundPayments.filter(p => p.status === 'completed').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fon Ödeme Detayları</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {fund.title} için planlanan ödeme emirleri ve taksitler
                    </p>
                </div>
            </div>

            {/* Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Toplam Taksit</div>
                    <div className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{totalPayments} Ödeme</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ödenen</div>
                    <div className="text-3xl font-bold mt-1 text-green-600 dark:text-green-500">{paidPayments} Ödeme</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Bekleyen</div>
                    <div className="text-3xl font-bold mt-1 text-orange-500 dark:text-orange-400">{totalPayments - paidPayments} Ödeme</div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4 md:p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Ödeme Emirleri</h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {fundPayments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Henüz bu fon için oluşturulmuş bir ödeme planı (taksit) bulunmuyor. <br /> Fon havuzundan bursiyer seçtiğinizde taksitler otomatik oluşacaktır.
                        </div>
                    ) : (
                        fundPayments.map((payment, i) => (
                            <div key={payment.id} className={`p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors ${payment.status === 'completed' ? 'opacity-80' : ''}`}>

                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-full flex-shrink-0 ${payment.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                                        {payment.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {payment.amount} ₺
                                            </span>
                                            {payment.application && payment.application.user && (
                                                <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                                    <Users className="w-3 h-3" /> {payment.application.user.fullName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                                                {payment.paymentDate ? format(new Date(payment.paymentDate), "MMMM yyyy", { locale: tr }) : "Bilinmeyen Tarih"}
                                            </span>
                                            <span className="text-gray-300 dark:text-zinc-700">•</span>
                                            <span>{payment.notes || "Aylık Ödeme Taksiti"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex justify-end">
                                    {payment.status === 'completed' ? (
                                        <div className="text-sm font-bold text-green-600 dark:text-green-400 px-4 py-2 border border-green-200 dark:border-green-900/50 rounded-lg bg-green-50 dark:bg-green-900/10 w-full text-center">
                                            Ödendi
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-orange-600 dark:text-orange-400 px-4 py-2 w-full text-center md:text-right">
                                            Bekliyor
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
