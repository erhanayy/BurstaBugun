import { db } from "@/lib/db";
import { funds } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Search, Briefcase } from "lucide-react";
import FundsTable from "./funds-table";

export default async function AdminFundsPage({ searchParams }: { searchParams: { search?: string, period?: string, status?: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return redirect("/unauthorized");
    }

    const resolvedParams = await searchParams;
    const searchObj = resolvedParams;

    const targetPeriod = searchObj.period || "all";
    const targetStatus = searchObj.status || "all";

    const conditions = [];
    conditions.push(eq(funds.tenantId, tenantData.tenantId));

    if (targetPeriod !== "all") {
        conditions.push(eq(funds.period, targetPeriod));
    }

    if (targetStatus === "active") {
        conditions.push(eq(funds.isActive, true));
    } else if (targetStatus === "completed") {
        conditions.push(eq(funds.isActive, false));
    }

    if (searchObj.search) {
        conditions.push(
            ilike(funds.title, `%${searchObj.search}%`)
        );
    }

    // Fetch funds with owner and selections to calculate stats
    const fundsList = await db.query.funds.findMany({
        where: and(...conditions),
        orderBy: [desc(funds.createdAt)],
        with: {
            owner: true,
            selections: true,
        }
    });

    const uiFunds = fundsList.map(f => {
        // Fon araması owner ismi ile de eşleşmeli (ilike yukarda owner'da join yapmadığı için burada filter yapıyoruz)
        const matchSearch = searchObj.search ? (
            f.title.toLowerCase().includes(searchObj.search.toLowerCase()) || 
            (f.owner?.name || "").toLowerCase().includes(searchObj.search.toLowerCase())
        ) : true;

        return {
            id: f.id,
            title: f.title,
            ownerName: f.owner?.name || "Bilinmiyor",
            period: f.period || "-",
            targetStudentCount: f.targetStudentCount || 0,
            matchedStudentCount: f.selections.length,
            isActive: f.isActive,
            matchSearch
        };
    }).filter(f => f.matchSearch);

    // Get unique periods for filter
    const allPeriods = await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantData.tenantId),
        columns: { period: true }
    });
    const uniquePeriods = Array.from(new Set(allPeriods.map(p => p.period).filter(Boolean)));
    uniquePeriods.sort((a, b) => (b || "").localeCompare(a || ""));

    return (
        <div className="space-y-6">
            <div className="bg-fbiad-blue/10 border border-fbiad-blue/30 rounded-xl p-4 flex gap-3 text-sm text-fbiad-dark-blue">
                <Briefcase className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    Aşağıdaki liste, sistemde tanımlı olan tüm fonları ve genel durumlarını göstermektedir.
                </p>
            </div>

            <form className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-[2] relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        name="search"
                        defaultValue={searchObj.search}
                        placeholder="Fon Adı veya Kurucu Adı..."
                        className="w-full pl-9 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-fbiad-blue"
                    />
                </div>
                <div className="flex-1">
                    <select name="period" defaultValue={targetPeriod} className="w-full h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="all">Tüm Dönemler</option>
                        {uniquePeriods.map(p => (
                            <option key={p} value={p!}>{p}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <select name="status" defaultValue={targetStatus} className="w-full h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                        <option value="all">Tüm Fonlar</option>
                        <option value="active">Aktif Fonlar</option>
                        <option value="completed">Kapanmış Fonlar</option>
                    </select>
                </div>
                <button type="submit" className="w-full md:w-auto h-10 px-8 bg-fbiad-blue text-white rounded-md text-sm font-medium hover:bg-fbiad-dark-blue whitespace-nowrap">
                    Filtrele
                </button>
            </form>

            <FundsTable funds={uiFunds} />
        </div>
    );
}
