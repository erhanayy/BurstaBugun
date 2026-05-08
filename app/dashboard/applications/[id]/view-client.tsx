"use client";

import { ArrowLeft, CheckCircle2, FileText, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function ViewClient({ application, studentName }: { application: any, studentName: string }) {
    const answers = application.answersJson ? JSON.parse(application.answersJson) : {};
    const steps = application.form?.steps || [];
    const router = useRouter();

    return (
        <div className="space-y-6">
            <button onClick={() => router.back()} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Önceki Ekrana Dön
            </button>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{application.form?.title || "Burs Başvurusu"} Değerlendirme Özeti</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Bu sayfada sisteme kaydedilen form girdilerini salt okunur formatta inceleyebilirsiniz. Form gönderildikten sonra üzerinde değişiklik yapılamaz.
                        </p>
                    </div>
                    {studentName && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl text-center min-w-[200px]">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Aday / Bursiyer</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{studentName}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {steps.map((step: any, sIdx: number) => (
                        <div key={step.id || sIdx} className="space-y-4">
                            <h2 className="text-lg font-semibold border-b border-gray-100 dark:border-zinc-800 pb-2 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{sIdx + 1}</span>
                                {step.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {step.fields.map((field: any, fIdx: number) => {
                                    const val = answers[field.name];
                                    return (
                                        <div key={fIdx} className="bg-gray-50 flex flex-col justify-center dark:bg-zinc-950/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{field.name}</span>
                                            {field.type === 'file' ? (
                                                val ? (
                                                    <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium break-all">
                                                        <FileText className="w-4 h-4" /> Dosyayı Görüntüle
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">Yüklenmedi</span>
                                                )
                                            ) : (
                                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                                    {val || <span className="text-gray-400 italic">Belirtilmedi</span>}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
