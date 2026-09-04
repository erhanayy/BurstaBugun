import { db } from "@/lib/db";
import { funds, fundSelections, studentPaymentLogs } from "@/lib/db/schema";
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

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const targetMonth = searchObj.month === "" ? null : (searchObj.month ? parseInt(searchObj.month) : currentMonth);
    const targetYear = searchObj.year === "" ? null : (searchObj.year ? parseInt(searchObj.year) : currentYear);

    // Fetch existing payment logs for the target month/year
    const logs = await db.query.studentPaymentLogs.findMany({
        where: and(
            eq(studentPaymentLogs.tenantId, tenantData.tenantId),
            // We can fetch all logs and filter in memory, or use SQL, but in memory is fine for small amounts, or we filter later.
        )
    });

    // Create upcoming list dynamically from active selections
    let upcoming = activeSelections
        .filter(selection => {
            if (searchObj.fundId && selection.fundId !== searchObj.fundId) return false;
            return true;
        })
        .map(selection => {
            const hasPaid = logs.some(log => {
                const logDate = new Date(log.paymentDate);
                return log.applicationId === selection.applicationId &&
                       logDate.getMonth() + 1 === targetMonth &&
                       logDate.getFullYear() === targetYear;
            });

            if (hasPaid) return null; // Zaten ödenmiş

            return {
                id: `${selection.applicationId}-${targetMonth}-${targetYear}`, // unique fake id for UI
                fundTitle: selection.fund?.title || "Genel Fon",
                fundId: selection.fundId,
                applicationId: selection.applicationId,
                studentName: selection.application?.user?.fullName || "-",
                amount: selection.fund?.monthlyLimit || 0,
                month: targetMonth || currentMonth,
                year: targetYear || currentYear,
                dateString: format(new Date(targetYear || currentYear, (targetMonth || currentMonth) - 1, 1), "MMMM yyyy", { locale: tr })
            };
        })
        .filter(Boolean) as any[];

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
