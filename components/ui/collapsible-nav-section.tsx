"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function CollapsibleNavSection({
    title,
    storageKey,
    children,
    defaultExpanded = true,
}: {
    title: string;
    storageKey: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem(`nav-section-${storageKey}`);
        if (stored !== null) {
            setIsExpanded(stored === "true");
        }
    }, [storageKey]);

    const toggle = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(`nav-section-${storageKey}`, String(newState));
    };

    return (
        <div className="mb-2 mt-4 first:mt-0">
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between bg-white/10 text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/20 cursor-pointer"
                aria-expanded={isExpanded}
            >
                <span>{title}</span>
                {isMounted ? (
                    <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"
                            }`}
                    />
                ) : (
                    <ChevronDown
                        className={`w-3 h-3 ${isExpanded ? "" : "-rotate-90"}`}
                    />
                )}
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="mt-2 space-y-1">{children}</div>
                </div>
            </div>
        </div>
    );
}
