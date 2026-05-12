import { db } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Search, Heart } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import DonationsTable from "./donations-table";

export default async function AdminDonationsPage({ searchParams }: { searchParams: { search?: string, year?: string, month?: string, status?: string, fbiadMember?: string, wantsInfo?: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return redirect("/unauthorized");
    }

    const resolvedParams = await searchParams;
    const searchObj = resolvedParams;

    const targetMonth = searchObj.month === "" ? null : (searchObj.month ? parseInt(searchObj.month) : null);
    const targetYear = searchObj.year === "" ? null : (searchObj.year ? parseInt(searchObj.year) : null);
    const targetStatus = searchObj.status || "all";
    const fbiadMember = searchObj.fbiadMember;
    const wantsInfo = searchObj.wantsInfo;

    const conditions = [];
    conditions.push(eq(donations.tenantId, tenantData.tenantId));

    if (targetStatus !== "all") {
        conditions.push(eq(donations.status, targetStatus as any));
    }

    if (fbiadMember === "true") {
        conditions.push(eq(donations.isFbiadMember, true));
    } else if (fbiadMember === "false") {
        conditions.push(eq(donations.isFbiadMember, false));
    }

    if (wantsInfo === "true") {
        conditions.push(eq(donations.wantsMembershipInfo, true));
    } else if (wantsInfo === "false") {
        conditions.push(eq(donations.wantsMembershipInfo, false));
    }

    if (searchObj.search) {
        conditions.push(
            or(
                ilike(donations.donorName, `%${searchObj.search}%`),
                ilike(donations.donorTc, `%${searchObj.search}%`)
            )
        );
    }

    const donationsList = await db.query.donations.findMany({
        where: and(...conditions),
        orderBy: [desc(donations.createdAt)],
    });

    let filteredDonations = donationsList;

    if (targetYear !== null) {
        filteredDonations = filteredDonations.filter(d => new Date(d.createdAt).getFullYear() === targetYear);
    }
    if (targetMonth !== null) {
        filteredDonations = filteredDonations.filter(d => new Date(d.createdAt).getMonth() + 1 === targetMonth);
    }

    const uiDonations = filteredDonations.map(d => ({
        id: d.id,
        donorName: d.donorName || "-",
        donorTc: d.donorTc || "-",
        donorEmail: d.donorEmail || "-",
        donorPhone: d.donorPhone || "-",
        amount: d.amount,
        isAnonymous: d.isAnonymous,
        isFbiadMember: d.isFbiadMember,
        wantsMembershipInfo: d.wantsMembershipInfo,
        status: d.status,
        bankTransactionId: d.bankTransactionId || "-",
        dateString: format(new Date(d.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })
    }));

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    Aşağıdaki liste, harici web sitesi üzerinden gelen tüm bağış işlemlerini göstermektedir.
                </p>
            </div>

            <form className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-[2] relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            name="search"
                            defaultValue={searchObj.search}
                            placeholder="Ad Soyad veya T.C. Kimlik No..."
                            className="w-full pl-9 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <select name="status" defaultValue={searchObj.status || "all"} className="w-full h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                            <option value="all">Tüm İşlemler</option>
                            <option value="completed">Başarılı İşlemler</option>
                            <option value="failed">Başarısız İşlemler</option>
                        </select>
                    </div>
                    <div className="flex-1 flex gap-2">
                        <select name="year" defaultValue={searchObj.year ?? ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                            <option value="">Tüm Yıllar</option>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select name="month" defaultValue={searchObj.month ?? ""} className="w-1/2 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                            <option value="">Tüm Aylar</option>
                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{format(new Date(2024, i, 1), "MMMM", { locale: tr })}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 flex gap-4 w-full">
                        <select name="fbiadMember" defaultValue={searchObj.fbiadMember || "all"} className="flex-1 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                            <option value="all">Üyelik Durumu (Tümü)</option>
                            <option value="true">Sadece Dernek Üyeleri</option>
                            <option value="false">Üye Olmayanlar</option>
                        </select>
                        <select name="wantsInfo" defaultValue={searchObj.wantsInfo || "all"} className="flex-1 h-10 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-gray-100">
                            <option value="all">Bilgi İsteği (Tümü)</option>
                            <option value="true">Sadece Bilgi İsteyenler</option>
                            <option value="false">İstemeyenler</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full md:w-auto h-10 px-8 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
                        Filtrele
                    </button>
                </div>
            </form>

            <DonationsTable donations={uiDonations} />
        </div>
    );
}
