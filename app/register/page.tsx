import Image from 'next/image';
import Link from 'next/link';
import { RegisterForm } from './register-form';
import { getPublicTenantInfo } from "@/lib/data/tenant";

export default async function RegisterPage() {
    const tenantInfo = await getPublicTenantInfo();
    
    return (
        <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: tenantInfo.backgroundColor || undefined }}>
            {/* Left/Top Decorational Banner */}
            <div 
                className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 lg:w-5/12 text-white p-12"
                style={tenantInfo.primaryColor ? { backgroundImage: `linear-gradient(to bottom right, ${tenantInfo.primaryColor}, #312e81)` } : { backgroundImage: `linear-gradient(to bottom right, #1d4ed8, #312e81)` }}
            >
                <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20 p-4">
                    <Image src={tenantInfo.logoUrl || "/logo-v3-transparent.png"} alt={tenantInfo.tenantName} width={80} height={80} className="w-full h-full object-contain" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-center tracking-tight">Eğitimde Fırsat Eşitliği</h1>
                <p className="text-blue-100 text-center max-w-sm text-lg">
                    {tenantInfo.tenantName} platformuna katılarak binlerce yetenekli öğrencinin vizyonuna ortak olun veya eğitim hayatınız için aradığınız desteği bulun.
                </p>
                <div className="mt-12 space-y-4 w-full max-w-sm">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                        <h4 className="font-semibold mb-1">Şeffaf Değerlendirme</h4>
                        <p className="text-sm text-blue-200">Gelişmiş aday havuzu ile doğrudan en uygun fon eşleşmesi.</p>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Form Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 h-screen overflow-y-auto">
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl md:rounded-xl shadow-xl md:shadow-lg border border-gray-200 dark:border-zinc-800 p-8">

                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="md:hidden text-center mb-8 flex flex-col items-center">
                        <div className="w-16 h-16 flex items-center justify-center mb-4 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/20 p-2 border border-blue-100 dark:border-blue-900">
                            <Image src={tenantInfo.logoUrl || "/logo-v3-transparent.png"} alt={tenantInfo.tenantName} width={60} height={60} className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400" style={tenantInfo.primaryColor ? { backgroundImage: `linear-gradient(to right, ${tenantInfo.primaryColor}, #4f46e5)` } : {}}>
                            {tenantInfo.tenantName}
                        </h1>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hesap Oluştur</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Platforma dahil olmak için lütfen aşağıdaki bilgileri eksiksiz doldurun.
                        </p>
                    </div>

                    <RegisterForm primaryColor={tenantInfo.primaryColor} />

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Zaten bir hesabınız var mı?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400" style={tenantInfo.primaryColor ? { color: tenantInfo.primaryColor } : {}}>
                                Buradan Giriş Yapın
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
