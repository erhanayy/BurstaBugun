import { db } from "@/lib/db";
import { applications, users, funds, fundSelections } from "@/lib/db/schema";
import { eq, and, isNotNull, or } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Bursiyer Ödeme (IBAN) Raporu",
};

export default async function AdminIbansPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.role !== 'admin' && tenantData.role !== 'superadmin') {
        redirect("/dashboard");
    }

    // Havuza seçilmiş (pool) veya fona atanmış (active) olan ve IBAN bilgisini girmiş öğrencileri çekelim.
    const activeStudents = await db.query.applications.findMany({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            or(eq(applications.status, 'pool'), eq(applications.status, 'active'))
        ),
        with: {
            user: true,
            selections: {
                where: eq(fundSelections.isActive, true),
                with: { fund: true }
            }
        }
    });

    const reportData = activeStudents.map(app => {
        const user = app.user;
        const fundNames = app.selections?.map(s => s.fund?.title).join(", ") || "Havuza Bekliyor";
        
        return {
            id: app.id,
            studentName: user?.fullName || "Bilinmiyor",
            phone: user?.phoneNumber || "",
            status: app.status === 'active' ? 'Aktif Bursiyer' : 'Havuzda',
            fundNames,
            ibanName: user?.ibanName || "",
            iban: user?.iban || "",
            hasIban: !!user?.iban
        };
    }).sort((a, b) => {
        if (a.hasIban && !b.hasIban) return -1;
        if (!a.hasIban && b.hasIban) return 1;
        return a.studentName.localeCompare(b.studentName);
    });

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bursiyer Ödeme (IBAN) Raporu</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Havuza seçilmiş veya aktif burs alan öğrencilerin IBAN bilgilerini buradan görüntüleyebilirsiniz.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Öğrenci Adı</th>
                                <th className="px-4 py-3">Telefon</th>
                                <th className="px-4 py-3">Durum / Fon</th>
                                <th className="px-4 py-3">IBAN Alıcı Adı</th>
                                <th className="px-4 py-3">IBAN Numarası</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        Raporlanacak öğrenci bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                reportData.map(row => (
                                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.studentName}</td>
                                        <td className="px-4 py-3 text-gray-500">{row.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-1 ${row.status === 'Aktif Bursiyer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {row.status}
                                            </span>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.fundNames}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.hasIban ? (
                                                <span className="font-medium">{row.ibanName}</span>
                                            ) : (
                                                <span className="text-red-500 text-xs italic">Girmedi</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.hasIban ? (
                                                <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono tracking-wider">{row.iban}</code>
                                            ) : (
                                                <span className="text-red-500 text-xs italic">Eksik</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
