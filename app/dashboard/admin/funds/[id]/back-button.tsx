"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
    
    return (
        <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 hover:text-fbiad-blue hover:border-fbiad-blue transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
    );
}
