import Link from "next/link";
import {
    Home,
    LayoutDashboard,
    Settings,
    FileText,
    Users,
    Building,
    CheckSquare,
    Landmark,
    LogOut,
    Menu,
    Wallet
} from "lucide-react";

import { getCurrentTenant } from "@/lib/data/tenant";
import { SignOutButton } from "@/components/sign-out-button";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { ForcePasswordCheck } from "./force-password-check";
import { ContractEnforcer } from "./contract-enforcer";
import { getMissingContracts } from "@/lib/actions/agreements";
import { auth } from "@/auth";
import Image from "next/image";
import { CollapsibleNavSection } from "@/components/ui/collapsible-nav-section";
import { NotificationBell } from "@/components/notification-bell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    const tenantData = await getCurrentTenant();
    const activeTenantName = tenantData?.tenantShortName || "BurstaBugün";
    const userRole = tenantData?.userRole || "applicant"; // default

    const isForceChange = tenantData?.forcePasswordChange;

    if (isForceChange) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
                <ForcePasswordCheck forcePasswordChange={!!isForceChange} />
                <div className="w-full max-w-4xl">
                    <header className="mb-8 text-center flex flex-col items-center justify-center">
                        {/* Logo removed per request */}
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Bursta Bugün
                        </h1>
                    </header>
                    <main className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-2">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    let pendingContracts: any[] = [];
    if (tenantData?.userId) {
        pendingContracts = await getMissingContracts(tenantData.userId);
    }

    return (
        <>
            {tenantData?.userId && <ContractEnforcer userId={tenantData.userId} pendingContracts={pendingContracts} />}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --menu-text: #FFFFFF;
                    --screen-text: #1F2937;
                    --bg-color: #F9FAFB;
                    --header-bg: #1E3A5F;
                    --nav-bg: #2563EB;
                }
                .dark {
                    --bg-color: #18181b;
                    --screen-text: #f4f4f5;
                }
            `}} />
            <div className="h-screen overflow-hidden bg-[var(--bg-color)] dark:bg-[var(--bg-color)] text-[var(--screen-text)] dark:text-[var(--screen-text)] flex">
                <ForcePasswordCheck forcePasswordChange={false} />

                {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
                <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-[var(--nav-bg)] text-[var(--menu-text)] hidden lg:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200/20 dark:border-zinc-800 font-bold text-lg text-[var(--menu-text)]">
                        {tenantData?.userName}
                    </div>
                    <nav className="flex-1 p-4 overflow-y-auto space-y-1">

                        <CollapsibleNavSection title="Genel" storageKey="general">
                            <NavItem href="/dashboard/home" icon={Home} label="Ana Sayfa" />
                        </CollapsibleNavSection>

                        {/* Bursiyer Menüsü */}
                        {(userRole === 'applicant' || userRole === 'admin') && (
                            <CollapsibleNavSection title="Bursiyer" storageKey="applicant">
                                <NavItem href="/dashboard/applications/new" icon={FileText} label="Burs Başvurusu Yap" />
                                <NavItem href="/dashboard/applications" icon={LayoutDashboard} label="Başvurularım" />
                                <NavItem href="/dashboard/invitations" icon={CheckSquare} label="Davetler / Onaylar" />
                            </CollapsibleNavSection>
                        )}

                        {/* Bursveren Sponsor Menüsü */}
                        {(userRole === 'sponsor' || userRole === 'admin') && (
                            <CollapsibleNavSection title="Burs Fonları" storageKey="sponsor">
                                <NavItem href="/dashboard/funds" icon={Landmark} label="Fonlarım / Desteklerim" />
                                <NavItem href="/dashboard/invitations" icon={CheckSquare} label="Davetler / Onaylar" />
                                <NavItem href="/dashboard/pool" icon={Users} label="Bursiyer Havuzu" />
                            </CollapsibleNavSection>
                        )}

                        {/* Bursveren Katılımcı Menüsü */}
                        {(userRole === 'contributor') && (
                            <CollapsibleNavSection title="Destekçi" storageKey="contributor">
                                <NavItem href="/dashboard/funds" icon={Landmark} label="Destek Olduğum Fonlar" />
                            </CollapsibleNavSection>
                        )}

                        {/* Referans Menüsü */}
                        {(userRole === 'reference' || userRole === 'admin') && (
                            <CollapsibleNavSection title="Referans" storageKey="reference">
                                <NavItem href="/dashboard/references" icon={CheckSquare} label="Referans Onayları" />
                            </CollapsibleNavSection>
                        )}

                        {/* Ayarlar Menüsü (Tüm Roller) */}
                        <CollapsibleNavSection title="Ayarlar" storageKey="user">
                            <NavItem href="/dashboard/settings" icon={Settings} label="Ayarlar" />
                        </CollapsibleNavSection>

                        {/* Admin Menüsü (Sadece Admin) */}
                        {userRole === 'admin' && (
                            <CollapsibleNavSection title="Sistem Yönetimi" storageKey="admin">
                                <NavItem href="/dashboard/payments/history" icon={Wallet} label="Ödeme Sayfası" />
                                <NavItem href="/dashboard/admin/forms" icon={CheckSquare} label="Başvuru Tasarımcısı (Builder)" />
                                <NavItem href="/dashboard/admin/agreements" icon={FileText} label="Sözleşme / Metinler" />
                                <NavItem href="/dashboard/admin/parameters" icon={Settings} label="Sistem Parametreleri" />
                            </CollapsibleNavSection>
                        )}

                    </nav>
                    <div className="p-4 border-t border-white/10">
                        <SignOutButton />
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                    <header
                        className="min-h-14 lg:h-14 border-b border-gray-200/20 dark:border-zinc-800 bg-[var(--header-bg)] text-white flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
                        style={{ paddingTop: 'env(safe-area-inset-top)' }}
                    >
                        {/* Left: Logo Name */}
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-semibold">{activeTenantName}</span>
                        </div>

                        {/* Right: tools layout */}
                        <div className="flex items-center gap-3">
                            {tenantData && (
                                <div className="hidden lg:flex items-center gap-4">
                                    <TenantSwitcher
                                        currentTenant={{
                                            id: tenantData.tenantId,
                                            shortName: tenantData.tenantShortName,
                                            longName: tenantData.tenantName
                                        }}
                                        availableTenants={tenantData.availableTenants}
                                    />

                                    <div className="h-6 w-px bg-white/20 mx-1"></div>

                                    {/* 1. Bildirim Logosu */}
                                    <NotificationBell tenantId={tenantData.tenantId} userId={tenantData.userId} />

                                    {/* 2. Kişi Adı Baş Harfleri Logosu */}
                                    <div className="w-9 h-9 rounded-full relative overflow-hidden ring-2 ring-white/20 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-400 opacity-90" />
                                        <span className="relative z-10 text-white font-bold text-sm tracking-wider">
                                            {tenantData.userName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AB'}
                                        </span>
                                    </div>

                                    {/* 3. Uygulama Logosu */}
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-md p-1 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                        <Image src="/logo.png" alt="BurstaBugün Logo" width={40} height={40} className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}

                            {/* Mobile menu trigger */}
                            <div className="lg:hidden p-2">
                                <Menu className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-hidden max-w-full w-full pb-[calc(env(safe-area-inset-bottom)+2rem)] lg:pb-6">{children}</main>
                </div>
            </div>
        </>
    );
}

function NavItem({
    href,
    icon: Icon,
    label,
    badge,
}: {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    badge?: number;
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-white/80 hover:bg-white/10 hover:text-white"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 opacity-80" />
                {label}
            </div>
            {badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center shadow-sm border border-white/20">
                    {badge}
                </span>
            )}
        </Link>
    );
}
