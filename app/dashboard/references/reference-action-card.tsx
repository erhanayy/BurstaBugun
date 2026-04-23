"use client";

import { useTransition, useState } from "react";
import { processReferenceApproval } from "@/lib/actions/reference";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ReferenceActionCard({ referenceId, status, initialComment }: { referenceId: string, status: string, initialComment?: string | null }) {
    const [isPending, startTransition] = useTransition();
    const [comment, setComment] = useState(initialComment || "");

    const handleResponse = (isApproved: boolean) => {
        if (!isApproved && comment.length < 10) {
            toast.error("Lütfen red nedeninizi detaylıca açıklayın.");
            return;
        }

        startTransition(async () => {
            try {
                await processReferenceApproval(referenceId, isApproved ? 'approved' : 'rejected', comment);
                toast.success(isApproved ? "Referansınız onaylandı." : "Referansınız reddedildi.");
            } catch (error: any) {
                toast.error(error.message || "İşlem sırasında bir hata oluştu.");
            }
        });
    };

    if (status === 'approved') {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mt-4">
                <div className="flex items-center text-green-700 dark:text-green-400 font-medium mb-2">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Bu adayı desteklediniz.
                </div>
                {comment && <p className="text-sm text-green-600 dark:text-green-500 italic mt-1">"{comment}"</p>}
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mt-4">
                <div className="flex items-center text-red-700 dark:text-red-400 font-medium mb-2">
                    <XCircle className="w-5 h-5 mr-2" />
                    Bu adayı desteklemediniz.
                </div>
                {comment && <p className="text-sm text-red-600 dark:text-red-500 italic mt-1">"{comment}"</p>}
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Referans Değerlendirmeniz
                </label>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Öğrenci hakkındaki düşüncelerinizi, başarılarını veya destekleme/desteklememe nedenlerinizi buraya yazabilirsiniz..."
                    className="resize-none h-24"
                    disabled={isPending}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={() => handleResponse(true)}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Destekliyorum / Onayla
                </Button>
                <Button
                    onClick={() => handleResponse(false)}
                    disabled={isPending}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1"
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Desteklemiyorum / Reddet
                </Button>
            </div>
        </div>
    );
}
