"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareFundButtonProps {
    fund: {
        title: string;
        description: string | null;
        shareMessage: string | null;
    };
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    iconOnly?: boolean;
}

export function ShareFundButton({ fund, variant = "outline", size = "sm", className = "", iconOnly = false }: ShareFundButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        const defaultMessage = `Bu fona destek olmak istiyorsanız, fon sahibi ile iletişime geçerek sistem davetiyesi talep edebilirsiniz.`;
        
        const shareText = `🌟 *${fund.title}*\n\n${fund.description ? fund.description + '\n\n' : ''}💡 ${fund.shareMessage || defaultMessage}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: fund.title,
                    text: shareText
                });
                return; // Native share successful
            } catch (error: any) {
                // If user cancels the share, we just ignore
                if (error.name !== 'AbortError') {
                    console.error("Paylaşım hatası:", error);
                } else {
                    return;
                }
            }
        }

        // Fallback: Copy to clipboard if Web Share API is not supported or failed
        try {
            await navigator.clipboard.writeText(shareText);
            setIsCopied(true);
            toast.success("Paylaşım metni panoya kopyalandı! İstediğiniz yere yapıştırabilirsiniz.");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Metin kopyalanamadı.");
        }
    };

    // Styling based on variant/size to match the app's existing UI components loosely
    // Note: Can integrate with shadcn/ui Button if preferred, but doing it raw for independence
    let baseClass = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50";
    
    if (variant === "outline") baseClass += " border border-gray-300 dark:border-zinc-700 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300";
    else if (variant === "secondary") baseClass += " bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100";
    else if (variant === "ghost") baseClass += " hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-50";
    else baseClass += " bg-blue-600 hover:bg-blue-700 text-white shadow-sm"; // default

    if (size === "sm") baseClass += " h-9 px-3 text-xs";
    else if (size === "lg") baseClass += " h-11 px-8 text-base";
    else if (size === "icon") baseClass += " h-9 w-9";
    else baseClass += " h-10 px-4 py-2 text-sm"; // default

    const Icon = isCopied ? Check : Share2;

    return (
        <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
            className={`${baseClass} ${className}`}
            title="Whatsapp'ta Paylaş"
        >
            <Icon className={`${iconOnly ? '' : 'mr-2'} ${size === 'sm' || size === 'icon' ? 'h-4 w-4' : 'h-5 w-5'} ${isCopied ? 'text-green-500' : ''}`} />
            {!iconOnly && "Paylaş"}
        </button>
    );
}
