'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants, tenantUsers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function getCurrentTenant() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const cookieStore = await cookies();
    const tenantIdFromCookie = cookieStore.get('dernekte_tenant_id')?.value;

    if (session.user.isApplicationAdmin) {
        // Fetch all tenants for super admins
        const allTenants = await db.select().from(tenants).where(eq(tenants.isActive, true));
        if (allTenants.length === 0) return null;

        let selectedTenant = allTenants[0];
        if (tenantIdFromCookie) {
            const found = allTenants.find(t => t.id === tenantIdFromCookie);
            if (found) selectedTenant = found;
        }

        const [currentUser] = await db.select().from(users).where(eq(users.id, session.user.id));

        return {
            tenantId: selectedTenant.id,
            userId: session.user.id,
            tenantName: selectedTenant.longName,
            tenantShortName: selectedTenant.shortName,
            logoUrl: selectedTenant.logoUrl,
            websiteUrl: selectedTenant.websiteUrl,
            userRole: 'admin',
            userName: currentUser?.fullName || session.user.name || "Uygulama Yöneticisi",
            availableTenants: allTenants,
            forcePasswordChange: currentUser?.forcePasswordChange ?? false,
        };
    }

    // Normal Users
    // Fetch all memberships for the user
    // This allows us to:
    // 1. Validate the cookie ID (is user actually a member?)
    // 2. Fallback to the first membership if cookie is invalid/missing
    // 3. Provide a list of available tenants for the switcher UI
    const memberships = await db.select({
        role: tenantUsers.role,
        tenant: tenants,
        user: users
    })
        .from(tenantUsers)
        .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(and(eq(tenantUsers.userId, session.user.id), eq(tenants.isActive, true)));

    if (memberships.length === 0) return null;

    let activeMembership = null;

    if (tenantIdFromCookie) {
        activeMembership = memberships.find(m => m.tenant.id === tenantIdFromCookie);
    }

    // Fallback: If no cookie or cookie is invalid (user not member of that tenant), use the first one
    if (!activeMembership) {
        activeMembership = memberships[0];
    }

    return {
        tenantId: activeMembership.tenant.id,
        userId: session.user.id,
        tenantName: activeMembership.tenant.longName,
        tenantShortName: activeMembership.tenant.shortName,
        logoUrl: activeMembership.tenant.logoUrl,
        websiteUrl: activeMembership.tenant.websiteUrl,
        userRole: activeMembership.role,
        userName: activeMembership.user.fullName || session.user.name || "Kullanıcı",
        availableTenants: memberships.map(m => m.tenant),
        forcePasswordChange: activeMembership.user.forcePasswordChange,
    };
}
