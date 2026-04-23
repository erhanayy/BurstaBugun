import { getReferenceRequests } from "@/lib/actions/reference";
import { ReferenceActionCard } from "./reference-action-card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckSquare, UserCircle } from "lucide-react";

export default async function ReferencesPage() {
    const referencesData = await getReferenceRequests();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Referans Onayları</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Sizden referans talep eden öğrencilerin başvurularını inceleyin ve değerlendirmenizi yapın.
                </p>
            </div>

            {referencesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center px-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Bekleyen İstek Yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Şu anda tarafınıza iletilmiş herhangi bir referans onay talebi bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {referencesData.map((ref) => {
                        let answers: any = {};
                        try {
                            if (ref.application?.answersJson) {
                                answers = JSON.parse(ref.application.answersJson);
                            }
                        } catch (e) {
                            console.error("Parse error", e);
                        }

                        return (
                            <div key={ref.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
                                                {ref.application?.user?.fullName?.charAt(0) || <UserCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {ref.application?.user?.fullName || "Bilinmeyen Bursiyer"}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">{ref.application?.fund?.title}</span> programı için başvuruda bulundu.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {format(new Date(ref.createdAt), "d MMMM yyyy", { locale: tr })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Eğitim Bilgisi</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{answers.schoolName} - {answers.programName}</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Not Ortalaması</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{answers.gpa || "Belirtilmemiş"}</span>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Başvuru Motivasyonu</h4>
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 border-l-4 border-blue-400 rounded-r-lg italic text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            "{answers.motivationLetter || "Motivasyon mektubu eklenmemiş."}"
                                        </div>
                                    </div>

                                    <ReferenceActionCard
                                        referenceId={ref.id}
                                        status={ref.status}
                                        initialComment={ref.comment}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
