'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileMenu({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 text-white">
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--nav-bg)] text-[var(--menu-text)] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Close Button */}
                <div className="absolute top-3 right-3 z-50">
                    <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {children}
            </div>
        </>
    );
}
