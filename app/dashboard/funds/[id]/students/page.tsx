import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applications, funds } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Users, FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function FundStudentsPage({ params }: { params: { id: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await params;

    const fund = await db.query.funds.findFirst({
        where: and(
            eq(funds.id, resolvedParams.id),
            eq(funds.tenantId, tenantData.tenantId)
        )
    });

    if (!fund) return redirect("/dashboard/funds");

    const selectedStudents = await db.query.applications.findMany({
        where: and(
            eq(applications.fundId, resolvedParams.id),
            eq(applications.status, 'selected')
        ),
        with: {
            user: true,
            form: true
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)],
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Bursiyerlerim</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        <strong>{fund.title}</strong> fonu tarafından desteklenen ve seçilmiş olan öğrenciler listelenmektedir.
                    </p>
                </div>
                <Link href="/dashboard/funds" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Fonlara Dön
                </Link>
            </div>

            {selectedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Henüz Bursiyer Seçilmemiş</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        Bu fon için henüz desteklemeye karar verdiğiniz bir öğrenci bulunmuyor.
                    </p>
                    <Link href={`/dashboard/pool?fundId=${fund.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">
                        Havuza Git ve İncele
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {selectedStudents.map((app) => {
                        let answers: any = {};
                        try {
                            if (app.answersJson) {
                                answers = JSON.parse(app.answersJson);
                            }
                        } catch (e) { }

                        const keys = Object.keys(answers);
                        const schoolName = keys.find(k => k.toLowerCase().includes("okul") || k.toLowerCase().includes("üni")) ? answers[keys.find(k => k.toLowerCase().includes("okul") || k.toLowerCase().includes("üni")) as string] : "-";
                        const progName = keys.find(k => k.toLowerCase().includes("bölüm") || k.toLowerCase().includes("program")) ? answers[keys.find(k => k.toLowerCase().includes("bölüm") || k.toLowerCase().includes("program")) as string] : "-";
                        const gpa = keys.find(k => k.toLowerCase().includes("not") || k.toLowerCase().includes("gpa") || k.toLowerCase().includes("gano")) ? answers[keys.find(k => k.toLowerCase().includes("not") || k.toLowerCase().includes("gpa") || k.toLowerCase().includes("gano")) as string] : "-";
                        const income = keys.find(k => k.toLowerCase().includes("gelir")) ? answers[keys.find(k => k.toLowerCase().includes("gelir")) as string] : "-";

                        return (
                            <div key={app.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                                                {fund.title}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                {app.user?.fullName}
                                                <CheckCircle2 className="ml-2 w-5 h-5 text-emerald-500" />
                                            </h3>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                                            {format(new Date(app.createdAt), "d MMMM yyyy", { locale: tr })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Okul / Üniversite</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{schoolName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Bölüm / Program</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{progName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Not Ortalaması</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{gpa}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Hane Geliri</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{income}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-emerald-100 dark:border-emerald-900/30 md:w-64">
                                    <div className="text-center md:text-right mb-4">
                                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">Seçilmiş Öğrenci</p>
                                        <p className="text-emerald-600/80 dark:text-emerald-400/80 flex items-center justify-center md:justify-end text-sm mt-1">Ödeme süreçleri devam ediyor</p>
                                    </div>
                                    <div className="mt-auto space-y-2 w-full">
                                        <Link href={`/dashboard/funds/${fund.id}/students/${app.id}/payments`} className="px-4 py-2 w-full text-center bg-emerald-600 border border-transparent text-sm font-medium text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center">
                                            Ödeme Detaylarını Gör
                                        </Link>
                                        <Link href={`/dashboard/applications/${app.id}`} className="px-4 py-2 w-full text-center bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Başvuru Detayını Gör
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
