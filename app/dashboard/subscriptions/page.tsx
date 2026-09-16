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
    const pendingPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.status, 'pending'),
            eq(payments.paymentMethod, 'subscription')
        ),
        with: {
            fund: true,
            user: true
        }
    });

    // Group for the client
    const groupedSubscriptionsMap = new Map<string, any>();

    pendingPayments.forEach(p => {
        const sponsorName = p.user?.fullName || 'Bilinmeyen Bursveren';
        const isArdaErel = sponsorName.toLowerCase().includes('arda erel');
        
        let groupKey = p.id; // Default to no grouping for exceptions
        
        if (!isArdaErel) {
            const dateStr = p.paymentDate ? `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}` : 'unknown';
            groupKey = `${p.userId || 'nouser'}-${p.fundId}-${dateStr}`;
        }

        if (!groupedSubscriptionsMap.has(groupKey)) {
            groupedSubscriptionsMap.set(groupKey, {
                id: p.id,
                fundName: p.fund?.title || 'Bilinmeyen Fon',
                studentName: "Öğrenci Seçimi Bekleniyor",
                sponsorName: sponsorName,
                amount: p.amount || 0,
                dueDate: p.paymentDate ? p.paymentDate.toISOString() : '',
                status: p.status,
                userId: p.userId,
                combinedIds: [p.id]
            });
        } else {
            const existing = groupedSubscriptionsMap.get(groupKey)!;
            existing.amount += (p.amount || 0);
            existing.combinedIds.push(p.id);
            existing.id += `,${p.id}`; // Optional: keep id unique
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
