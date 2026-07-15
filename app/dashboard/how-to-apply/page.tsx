import React from 'react';
import { 
    Download, 
    FileText, 
    UserPlus, 
    UserCheck, 
    CheckCircle2, 
    Search, 
    Banknote, 
    AlertCircle,
    ArrowDown,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function HowToApplyPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Burs Başvuru Akışı
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        BurstaBugün portalında burs başvurunuzun baştan sona hangi aşamalardan geçtiğini aşağıdan inceleyebilirsiniz.
                    </p>
                </div>
                <div>
                    <a 
                        href="/docs/burs_basvuru_akisi.pdf" 
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Akış Şemasını İndir (PDF)
                    </a>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-10 shadow-sm">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center max-w-md mx-auto mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white dark:ring-zinc-900 z-10">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Başvuru Oluşturulur</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Öğrenci platform üzerinden kişisel bilgilerini, eğitim ve iletişim detaylarını doldurarak başvuruyu başlatır.
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <ArrowDown className="text-gray-300 dark:text-zinc-700 w-8 h-8" />
                </div>

                {/* Step 2 Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* Background connector line for desktop */}
                    <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-0.5 bg-gray-200 dark:bg-zinc-800 -z-10"></div>
                    
                    {/* 2A Yeni Öğrenci */}
                    <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 relative">
                        <div className="absolute -top-4 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Yeni Başvuru
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-4 mt-2">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">2A. Referans Bilgileri</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Daha önce burs almamış öğrenciler, kendilerini tanıyan 2 referansın iletişim bilgisini girer.
                        </p>
                        <div className="my-4"><ArrowDown className="text-gray-300 dark:text-zinc-600 w-6 h-6 mx-auto" /></div>
                        <div className="w-full bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <span className="flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-400">
                                <AlertCircle className="w-4 h-4 mr-1.5" /> Referans Onayları Beklenir
                            </span>
                        </div>
                    </div>

                    {/* 2B Eski Öğrenci */}
                    <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 relative">
                        <div className="absolute -top-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Eski Bursiyer
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 mt-2">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">2B. Muafiyet Talebi</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Geçen yıl burs almış ve şartları sağlayan öğrenciler referans girmek yerine muafiyet talep eder.
                        </p>
                        <div className="my-4"><ArrowDown className="text-gray-300 dark:text-zinc-600 w-6 h-6 mx-auto" /></div>
                        <div className="w-full bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <span className="flex items-center justify-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                <AlertCircle className="w-4 h-4 mr-1.5" /> Muafiyet Onayı Beklenir
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center my-8">
                    <ArrowDown className="text-gray-300 dark:text-zinc-700 w-8 h-8" />
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center max-w-md mx-auto mb-8">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white dark:ring-zinc-900 z-10">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. İnceleme Aşaması</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Referans onaylarını tamamlamış veya muafiyet onayı almış olan başvurular, Vakıf yönetimi tarafından aday havuzunda incelenir.
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <ArrowDown className="text-gray-300 dark:text-zinc-700 w-8 h-8" />
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white dark:ring-zinc-900 z-10">
                        <Banknote className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Fon Ataması (Sonuç)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                        Uygun bulunan öğrenciler, açılan bir Burs Fonuna atanır ve "Aktif Bursiyer" statüsüne geçerek burs almaya hak kazanır.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-bold border border-green-200 dark:border-green-800/30">
                        <CheckCircle2 className="w-5 h-5" />
                        Aktif Bursiyer
                    </div>
                </div>

            </div>
        </div>
    );
}
