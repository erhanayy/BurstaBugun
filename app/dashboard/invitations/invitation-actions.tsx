"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { respondToInvitation } from "@/lib/actions/invitations";

export function InvitationActions({ invitationId, fundId }: { invitationId: string, fundId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleResponse = (status: "accepted" | "rejected") => {
        startTransition(async () => {
            try {
                const res = await respondToInvitation(invitationId, status);
                if (res.success) {
                    toast.success(`Davet başarıyla ${status === "accepted" ? "kabul edildi" : "reddedildi"}.`);
                    if (status === "accepted") {
                        router.push(`/dashboard/funds/${fundId}/payment`);
                    }
                }
            } catch (error: any) {
                toast.error(error.message || "İşlem gerçekleştirilemedi.");
            }
        });
    };

    return (
        <div className="flex gap-2 w-full mt-2">
            <button
                onClick={() => handleResponse("accepted")}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Kabul Et
            </button>
            <button
                onClick={() => handleResponse("rejected")}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Reddet
            </button>
        </div>
    );
}
