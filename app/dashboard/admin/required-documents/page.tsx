import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { getSignedDocumentDefinitions } from "@/lib/actions/signed-documents";
import { DocumentDefinitionForm } from "./document-definition-form";
import { FileCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "İmzalı Evrak Tanımları | BurstaBugün",
    description: "Öğrencilerden ve ilgililerden teslim alınacak ıslak imzalı doküman tanımları",
};

export const dynamic = 'force-dynamic';

export default async function RequiredDocumentsPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
        redirect("/dashboard/home");
    }

    const definitions = await getSignedDocumentDefinitions();

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Link href="/dashboard/admin/parameters" className="hover:text-gray-700 dark:hover:text-gray-200">
                            Ayarlar
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">İmzalı Evrak Tanımları</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                İmzalı Evrak Tanımları
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Öğrencilerden fiziki olarak teslim alınacak evrak türlerini ve dönem kurallarını yapılandırın
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/dashboard/admin/document-tracking"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
                >
                    <span>Evrak Takip Ekranına Git</span>
                </Link>
            </div>

            {/* Form & Table */}
            <DocumentDefinitionForm initialDefinitions={definitions} />
        </div>
    );
}
