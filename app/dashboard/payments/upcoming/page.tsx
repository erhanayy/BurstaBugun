import { db } from "@/lib/db";
import { funds, fundSelections, payments } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Search, CalendarDays } from "lucide-react";
import { format, addMonths } from "date-fns";
import { tr } from "date-fns/locale";
import UpcomingTable from "./upcoming-table";

export default async function UpcomingPaymentsPage({ searchParams }: { searchParams: { search?: string, fundId?: string, year?: string, month?: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await searchParams;
    const searchObj = resolvedParams;

    const allFunds = await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantData.tenantId),
        orderBy: (funds, { desc }) => [desc(funds.createdAt)],
    });

    const activeSelections = await db.query.fundSelections.findMany({
        where: eq(fundSelections.isActive, true),
        with: {
            fund: true,
            application: {
                with: { user: true }
            }
        }
    });

    const nextMonthDate = addMonths(new Date(), 1);
    const defaultNextMonth = nextMonthDate.getMonth() + 1;
    const defaultNextYear = nextMonthDate.getFullYear();

    const targetMonth = searchObj.month === "" ? null : (searchObj.month ? parseInt(searchObj.month) : null);
    const targetYear = searchObj.year === "" ? null : (searchObj.year ? parseInt(searchObj.year) : null);

    // Fetch actual pending payments from DB (Ödeme Emirleri)
    const conditions = [];
    conditions.push(eq(payments.tenantId, tenantData.tenantId));
    conditions.push(eq(payments.status, 'pending'));

    if (searchObj.fundId) {
        conditions.push(eq(payments.fundId, searchObj.fundId));
    }

    const pendingPayments = await db.query.payments.findMany({
        where: and(...conditions),
        with: {
            fund: true,
            application: {
                with: { user: true }
            }
        }
    });

    let upcoming = pendingPayments.map(payment => ({
        id: payment.id,
        fundTitle: payment.fund?.title || "Genel Fon",
        fundId: payment.fundId,
        applicationId: payment.applicationId || "",
        studentName: payment.application?.user?.fullName || "-",
        amount: payment.amount,
        month: payment.paymentDate ? new Date(payment.paymentDate).getMonth() + 1 : 0,
        year: payment.paymentDate ? new Date(payment.paymentDate).getFullYear() : 0,
        dateString: payment.paymentDate ? format(new Date(payment.paymentDate), "MMMM yyyy", { locale: tr }) : "Bilinmiyor"
    }));

    // Filter by explicitly selected month and year
    if (targetYear !== null) {
        upcoming = upcoming.filter(u => u.year === targetYear);
    }
    if (targetMonth !== null) {
        upcoming = upcoming.filter(u => u.month === targetMonth);
    }

    if (searchObj.search) {
        const lowerSearch = searchObj.search.toLowerCase();
        upcoming = upcoming.filter(u => u.studentName.toLowerCase().includes(lowerSearch));
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                <CalendarDays className="w-5 h-5 flex-shrink-0" />
                <p>
                    Aşağıdaki liste, sistemdeki aktif burs (seçilmiş öğrenci) ilişkilerine göre bir sonraki dönemin (veya seçilen hedefin) beklenen/planlanan tahmini ödemelerini temsil eder. Bu ekran henüz yapılmış kesin ödeme işlemlerini değil; <strong>ödemesi gelecek olan tahmini yükü</strong> gösterir.
                </p>
            </div>

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
                    <select name="year" defaultValue={searchObj.year ?? ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Yıllar (Hepsi)</option>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select name="month" defaultValue={searchObj.month ?? ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Aylar (Hepsi)</option>
                        {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{format(new Date(2024, i, 1), "MMMM", { locale: tr })}</option>)}
                    </select>
                </div>
                <button type="submit" className="h-10 px-6 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
                    Filtrele
                </button>
            </form>

            <UpcomingTable upcoming={upcoming} />
        </div>
    );
}
