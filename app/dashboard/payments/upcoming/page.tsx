import { db } from "@/lib/db";
import { funds, fundSelections, studentPaymentLogs, parametersTenantSeasons } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Search, CalendarDays } from "lucide-react";
import { format, addMonths } from "date-fns";
import { tr } from "date-fns/locale";
import UpcomingTable from "./upcoming-table";

export default async function UpcomingPaymentsPage({ searchParams }: { searchParams: { search?: string, fundId?: string, year?: string, month?: string, period?: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await searchParams;
    const searchObj = resolvedParams;

    const allFunds = await db.query.funds.findMany({
        where: and(eq(funds.tenantId, tenantData.tenantId), eq(funds.isActive, true)),
        orderBy: (funds, { desc }) => [desc(funds.createdAt)],
    });

    const activeSeasons = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (s, { desc }) => [desc(s.isDefault), desc(s.period)],
    });

    let currentPeriod = searchObj.period;
    if (!currentPeriod && activeSeasons.length > 0) {
        currentPeriod = activeSeasons.find(s => s.isDefault)?.id || activeSeasons[0]?.id;
    }

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

    const targetMonth = searchObj.month ? parseInt(searchObj.month) : null;
    const targetYear = searchObj.year ? parseInt(searchObj.year) : null;

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
            if (!selection.fund || !selection.fund.isActive) return false;
            if (searchObj.fundId && selection.fundId !== searchObj.fundId) return false;
            if (currentPeriod && selection.fund?.period !== currentPeriod) return false;
            return true;
        })
        .flatMap(selection => {
            const season = activeSeasons.find(s => s.id === selection.fund?.period);
            const duration = selection.fund?.durationMonths || season?.defaultFundDuration || 10;
            let startDate = selection.fund?.startDate;
            if (!startDate) {
                if (season?.studentPaymentStartDate) {
                    startDate = new Date(season.studentPaymentStartDate);
                } else {
                    startDate = new Date(); // fallback
                }
            }

            const installments = [];
            for (let i = 0; i < duration; i++) {
                const instDate = addMonths(new Date(startDate), i);
                const instMonth = instDate.getMonth() + 1;
                const instYear = instDate.getFullYear();

                if (targetMonth && instMonth !== targetMonth) continue;
                if (targetYear && instYear !== targetYear) continue;

                const hasPaid = logs.some(log => {
                    const logDate = new Date(log.paymentDate);
                    return log.applicationId === selection.applicationId &&
                           logDate.getMonth() + 1 === instMonth &&
                           logDate.getFullYear() === instYear;
                });

                if (hasPaid) continue; // Zaten ödenmiş

                installments.push({
                    id: `${selection.applicationId}-${instMonth}-${instYear}`, // unique fake id for UI
                    fundTitle: selection.fund?.title || "Genel Fon",
                    fundId: selection.fundId,
                    applicationId: selection.applicationId,
                    studentName: selection.application?.user?.fullName || "-",
                    amount: selection.fund?.monthlyLimit || 0,
                    month: instMonth,
                    year: instYear,
                    dateString: format(instDate, "MMMM yyyy", { locale: tr })
                });
            }
            return installments;
        });

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
                    <select name="period" defaultValue={currentPeriod || ""} className="w-full h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="">Tüm Dönemler</option>
                        {activeSeasons.map(s => <option key={s.id} value={s.id}>{s.period}</option>)}
                    </select>
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
