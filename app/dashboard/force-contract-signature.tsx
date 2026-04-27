"use client";

import { useState } from "react";
import { signContract } from "@/lib/actions/agreements";
import { Button } from "@/components/ui/button";
import { CopyPlus, FileText, CheckCircle2 } from "lucide-react";

export function ForceContractSignature({
    userId,
    pendingContracts
}: {
    userId: string;
    pendingContracts: any[]
}) {
    const [initialTotal] = useState(pendingContracts?.length || 0);
    const [loading, setLoading] = useState(false);

    if (!pendingContracts || pendingContracts.length === 0) return null;

    const currentContract = pendingContracts[0];
    const currentIndex = initialTotal - pendingContracts.length;

    // Determine type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'KVKK': return "KVKK ve Veri Politikası";
            case 'USER_AGREEMENT': return "Kullanıcı Sözleşmesi";
            case 'STUDENT_AGREEMENT': return "Aday/Bursiyer Taahhütnamesi";
            default: return "Sözleşme / Metin";
        }
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            await signContract(userId, currentContract.id);
            // "signContract" backendde revalidatePath çağırır, pendingContracts arrayi 1 eksilip yeniden gelir.
            // Bu sebeple bizim ekstra currentIndex artırmamıza gerek kalmaz.
        } catch (error) {
            console.error("Onaylama hatası:", error);
            alert("Sözleşme onaylanırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-col flex items-center justify-center p-4">
            <header className="mb-6 text-center flex flex-col items-center justify-center">
                <div className="bg-yellow-100 p-3 rounded-full mb-3 text-yellow-600">
                    <FileText className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Güncel Sözleşme Onayı Gerekiyor
                </h1>
                <p className="text-gray-500 max-w-md mt-2 text-sm">
                    Devam edebilmek için sistemde yenilenmiş veya yeni eklenmiş olan sözleşmeleri onaylamanız gerekmektedir.
                    ({pendingContracts.length} Onay Bekliyor)
                </p>
            </header>

            <main className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col max-h-[80vh]">
                <div className="border-b border-gray-200 dark:border-zinc-800 pb-4 mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {currentIndex + 1}. {getTypeLabel(currentContract.type)}
                        </h2>
                        <h3 className="text-sm font-medium text-gray-500 mt-1">{currentContract.title} (v{currentContract.version})</h3>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500">
                        {currentIndex + 1} / {initialTotal}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg border border-gray-100 dark:border-zinc-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {currentContract.content}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-4">
                    <Button
                        onClick={handleAccept}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        {loading ? "Onaylanıyor..." : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Okudum ve Kabul Ediyorum
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
