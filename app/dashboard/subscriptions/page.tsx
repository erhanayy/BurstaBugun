import { db } from "@/lib/db";
import { applications, funds, payments, users, fundSelections } from "@/lib/db/schema";
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
        sponsor: users
    })
    .from(payments)
    .innerJoin(funds, eq(payments.fundId, funds.id))
    .innerJoin(applications, eq(payments.applicationId, applications.id))
    .innerJoin(fundSelections, and(
        eq(fundSelections.fundId, payments.fundId),
        eq(fundSelections.applicationId, payments.applicationId)
    ))
    .innerJoin(users, eq(fundSelections.sponsorId, users.id))
    .where(
        and(
            eq(payments.status, 'pending'),
            eq(payments.paymentMethod, 'subscription'),
            eq(fundSelections.isActive, true)
        )
    );

    // Group for the client
    const groupedSubscriptionsMap = new Map<string, any>();

    pendingPayments.forEach(p => {
        const isArdaErel = p.sponsor.fullName.toLowerCase().includes('arda erel');
        
        let groupKey = p.payment.id; // Default to no grouping for exceptions
        
        if (!isArdaErel) {
            const dateStr = p.payment.paymentDate ? `${p.payment.paymentDate.getFullYear()}-${String(p.payment.paymentDate.getMonth() + 1).padStart(2, '0')}` : 'unknown';
            groupKey = `${p.sponsor.id}-${p.fund.id}-${dateStr}`;
        }

        if (!groupedSubscriptionsMap.has(groupKey)) {
            groupedSubscriptionsMap.set(groupKey, {
                id: p.payment.id,
                fundName: p.fund.title,
                studentName: "Bursiyer (Gizli)", // Simplified for demo
                sponsorName: p.sponsor.fullName,
                amount: p.payment.amount || 0,
                dueDate: p.payment.paymentDate ? p.payment.paymentDate.toISOString() : '',
                status: p.payment.status,
                userId: p.sponsor.id,
                combinedIds: [p.payment.id]
            });
        } else {
            const existing = groupedSubscriptionsMap.get(groupKey)!;
            existing.amount += (p.payment.amount || 0);
            existing.combinedIds.push(p.payment.id);
            existing.id += `,${p.payment.id}`; // Optional: keep id unique
        }
    });

    const subscriptions = Array.from(groupedSubscriptionsMap.values());

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
