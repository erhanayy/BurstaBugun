import { logoutAction } from "@/lib/actions/auth";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPublicTenantInfo } from "@/lib/data/tenant";

export default async function UnauthorizedPage() {
    const tenantInfo = await getPublicTenantInfo();
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: tenantInfo.backgroundColor || undefined }}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Erişim Reddedildi
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Bu platforma ({tenantInfo.tenantName}) erişim yetkiniz bulunmamaktadır. Lütfen doğru platformda olduğunuza veya üyeliğinizin onaylandığına emin olun.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border border-red-100">
                    
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Oturumu Kapat ve Geri Dön
                        </button>
                    </form>
                    
                    <div className="mt-6">
                        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                            Farklı bir hesapla giriş yapmayı deneyin
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
