import { db } from "@/lib/db";
import { applications, funds, payments, users } from "@/lib/db/schema";
import { and, eq, like, ne } from "drizzle-orm";
import SubscriptionList from "./subscription-list";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kredi Kartı Abonelikleri (Aylık Otomatik Çekim)",
};

export default async function SubscriptionsPage() {
    // Fetch all pending payments that are marked as 'subscription'
    const pendingPayments = await db.select({
        payment: payments,
        fund: funds,
        application: applications,
        user: users
    })
    .from(payments)
    .innerJoin(funds, eq(payments.fundId, funds.id))
    .innerJoin(applications, eq(payments.applicationId, applications.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(
        and(
            eq(payments.status, 'pending'),
            eq(payments.paymentMethod, 'subscription')
        )
    );

    // Format for the client
    const subscriptions = pendingPayments
        .map(p => ({
            id: p.payment.id,
            fundName: p.fund.title,
            studentName: "Bursiyer (Gizli)", // Simplified for demo, could join with student
            sponsorName: p.user.fullName,
            amount: p.payment.amount,
            dueDate: p.payment.paymentDate ? p.payment.paymentDate.toISOString() : '',
            status: p.payment.status,
            userId: p.user.id
        }));

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1200px] mx-auto w-full">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kredi Kartı Abonelikleri</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gelecek aylara ait kredi kartı otomatik tahsilat (Aylık Abonelik) bekleyen taksitleri buradan yönetebilir ve toplu çekim yapabilirsiniz.
                </p>
            </div>

            <SubscriptionList initialData={subscriptions} />
        </div>
    );
}
