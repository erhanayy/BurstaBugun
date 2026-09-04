"use client";

import { useState } from "react";
import { toggleApplicationActiveStatus, sendApplicantReminderEmail } from "@/lib/actions/admin";
import { Power, PowerOff, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used for toasts, standard in this project?
// Wait, I should just use standard alert if toast is not available, but let's try standard alert or basic state.
// Actually, let's use window.alert if needed, or if toast is available. I will check for sonner.
// To be safe, I will just use window.alert and a simple loading state.

export function ApplicantActions({ appId, isActive }: { appId: string, isActive: boolean }) {
    const [isToggling, setIsToggling] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            await toggleApplicationActiveStatus(appId, isActive);
            // Optional: show success message, but revalidatePath will refresh the UI anyway
        } catch (error: any) {
            window.alert("Hata: " + error.message);
        } finally {
            setIsToggling(false);
        }
    };

    const handleReminder = async () => {
        if (!window.confirm("Bu öğrenciye hatırlatma e-postası göndermek istediğinize emin misiniz?")) {
            return;
        }

        setIsSending(true);
        try {
            await sendApplicantReminderEmail(appId);
            window.alert("Hatırlatma e-postası başarıyla gönderildi!");
        } catch (error: any) {
            window.alert("Hata: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
            <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    isActive 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20" 
                    : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30 dark:hover:bg-green-900/20"
                }`}
            >
                {isToggling ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : (isActive ? <PowerOff className="w-3.5 h-3.5 mr-1.5" /> : <Power className="w-3.5 h-3.5 mr-1.5" />)}
                {isActive ? "Pasife Çek" : "Aktife Çek"}
            </button>
            
            <button
                onClick={handleReminder}
                disabled={isSending}
                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30 dark:hover:bg-blue-900/20 text-xs font-medium rounded-lg transition-colors"
            >
                {isSending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                Hatırlatma
            </button>
        </div>
    );
}
