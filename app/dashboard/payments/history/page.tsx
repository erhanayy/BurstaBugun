import { db } from "@/lib/db";
import { payments, funds, applications, users } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, desc, and, like, ilike } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Search, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import HistoryTable from "./history-table";

export default async function PaymentsHistoryPage({ searchParams }: { searchParams: { search?: string, fundId?: string, year?: string, month?: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await searchParams;
    const searchObj = resolvedParams;

    const allFunds = await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantData.tenantId),
        orderBy: (funds, { desc }) => [desc(funds.createdAt)],
    });

    const conditions = [];
    conditions.push(eq(payments.tenantId, tenantData.tenantId));
    conditions.push(eq(payments.status, 'completed')); // EXCLUDE PENDING

    if (searchObj.fundId) {
        conditions.push(eq(payments.fundId, searchObj.fundId));
    }

    // Currently drizzle-orm doesn't easily support month/year extraction directly without raw SQL.
    // As a simple alternative, we will fetch and filter in-memory for dates if they are selected.

    let history = await db.query.payments.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
            fund: true,
            application: {
                with: {
                    user: true
                }
            }
        },
        orderBy: [desc(payments.paymentDate), desc(payments.createdAt)],
    });

    // In-memory filters for nested fields / dates:
    if (searchObj.search) {
        const searchLower = searchObj.search.toLowerCase();
        history = history.filter(p => p.application?.user?.fullName?.toLowerCase().includes(searchLower));
    }

    if (searchObj.year) {
        history = history.filter(p => new Date(p.paymentDate || p.createdAt).getFullYear() === parseInt(searchObj.year!));
    }

    if (searchObj.month) {
        history = history.filter(p => new Date(p.paymentDate || p.createdAt).getMonth() + 1 === parseInt(searchObj.month!));
    }

    return (
        <div className="space-y-6">
            <form className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        name="search"
                        defaultValue={searchObj.search}
                        placeholder="Öğrenci arayın..."
                        className="w-full pl-9 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex-1">
                    <select name="fundId" defaultValue={searchObj.fundId || ""} className="w-full h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Fonlar</option>
                        {allFunds.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                </div>
                <div className="flex-1 flex gap-2">
                    <select name="year" defaultValue={searchObj.year || ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Yıllar</option>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select name="month" defaultValue={searchObj.month || ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Aylar</option>
                        {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{format(new Date(2024, i, 1), "MMMM", { locale: tr })}</option>)}
                    </select>
                </div>
                <button type="submit" className="h-10 px-6 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
                    Filtrele
                </button>
            </form>

            <HistoryTable history={history} />
        </div>
    );
}
