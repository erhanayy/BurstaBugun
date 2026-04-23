import { FundForm } from "./fund-form";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function NewFundPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <Link
                    href="/dashboard/funds"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Fonlara Dön
                </Link>
                <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 text-blue-600 dark:text-blue-400">
                        <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Yeni Fon Oluştur</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Bursiyerlere destek olmak için kendi şartlarınızla esnek bir burs fonu tanımlayın.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6 md:p-8">
                <FundForm />
            </div>
        </div>
    );
}
