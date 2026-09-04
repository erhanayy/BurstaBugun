import { db } from "@/lib/db";
import { funds, payments, fundContributors } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, CheckCircle2, Clock } from "lucide-react";
import { tr } from "date-fns/locale";
import { format } from "date-fns";
import { auth } from "@/auth";
import AppPaymentButton from "./app-payment-button";
import { IncreaseSponsorshipButton } from "./increase-sponsorship-button";

export default async function FundPaymentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const fundId = params.id;

    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const fund = await db.query.funds.findFirst({
        where: eq(funds.id, fundId),
        with: {
            invitations: {
                where: (invitations, { eq }) => eq(invitations.inviteeId, tenantData.userId)
            }
        }
    });

    if (!fund) redirect("/dashboard");

    const isPendingInvite = fund.invitations?.some(inv => inv.status === 'pending');

    // Fetch payments assigned to this schedule for THIS user
    const displayedPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.fundId, fundId),
            eq(payments.userId, tenantData.userId)
        ),
        orderBy: [asc(payments.paymentDate)]
    });

    // Determine the user's specific payment share
    const contributors = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fundId)
    });
    
    const isOwner = fund.ownerId === tenantData.userId;
    const myContribution = contributors.find(c => c.userId === tenantData.userId);
    let myCount = 1;

    if (myContribution) {
        myCount = myContribution.studentCount || 1;
    } else if (isOwner) {
        myCount = fund.targetStudentCount || 1;
    }

    const expectedTotalAmount = (fund.monthlyLimit || 0) * myCount * (fund.durationMonths || 10);
    const hasGeneratedPayments = displayedPayments.length > 0;
    const isUpfront = fund.paymentMethod === 'upfront';

    const totalPayments = hasGeneratedPayments ? displayedPayments.length : (isUpfront ? 1 : (fund.durationMonths || 10));
    const paidPayments = hasGeneratedPayments ? displayedPayments.filter(p => p.status === 'completed').length : 0;
    const totalAmount = hasGeneratedPayments 
        ? displayedPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
        : expectedTotalAmount;
    
    const session = await auth();
    const adSoyad = session?.user?.name || "Bilinmeyen Kullanıcı";

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
            {isPendingInvite && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Davetiniz Onay Bekliyor</h3>
                            <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                <p>Bu fona katılımcı olarak davet edildiniz. Ödeme detaylarını görebilmek ve işleme devam edebilmek için öncelikle davetinizi onaylamanız gerekmektedir.</p>
                            </div>
                            <div className="mt-3">
                                <a href="/dashboard/invitations" className="text-sm font-bold text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-100 bg-amber-100 dark:bg-amber-800/40 px-3 py-1.5 rounded-md transition-colors">
                                    Davetlerime Git
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{isUpfront ? 'Toplam İşlem' : 'Toplam Taksit'}</div>
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

            {/* In-App Payment Action */}
            {totalPayments > paidPayments && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {isUpfront ? 'Fon Ödemesini Gerçekleştir' : 'Kalan Tüm Taksitleri Öde'}
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1 mb-3">
                            <span suppressHydrationWarning>
                            {isUpfront 
                                ? `Fon taahhüdünüz olan toplam ${totalAmount.toLocaleString('tr-TR')} ₺ tutarı kredi kartınızdan tek seferde çekerek ödemenizi tamamlayabilirsiniz.`
                                : `Gelecek aylara ait tüm taksit tutarlarınızı (toplam ${totalAmount.toLocaleString('tr-TR')} ₺) kredi kartınızdan tek seferde provizyon olarak çekebilir ve ödeme planını kapatabilirsiniz.`}
                            </span>
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <AppPaymentButton fundId={fundId} />
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4 md:p-6 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Ödeme Emirleri</h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {displayedPayments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Henüz bu fon için oluşturulmuş bir ödeme planı (taksit) bulunmuyor. <br /> "Ödeme Yap" butonuna tıkladığınızda kapasiteniz doğrultusunda ({myCount} Öğrenci) ödeme planınız otomatik oluşacaktır.
                        </div>
                    ) : (
                        displayedPayments.map((payment, i) => (
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
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                                                <span suppressHydrationWarning>{payment.paymentDate ? format(new Date(payment.paymentDate), "MMMM yyyy", { locale: tr }) : "Bilinmeyen Tarih"}</span>
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
