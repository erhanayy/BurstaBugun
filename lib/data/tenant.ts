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
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const tenantIdFromCookie = envTenantId || cookieStore.get('dernekte_tenant_id')?.value;

    if (session.user.isApplicationAdmin) {
        // Fetch all tenants for super admins
        const allTenants = await db.select().from(tenants).where(eq(tenants.isActive, true));
        if (allTenants.length === 0) return null;

        let selectedTenant = allTenants[0];
        
        // Strict Mode Check
        if (envTenantId) {
            const found = allTenants.find(t => t.id === envTenantId);
            if (!found) return null; // Server configured for unknown tenant
            selectedTenant = found;
        } else if (tenantIdFromCookie) {
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
            primaryColor: selectedTenant.primaryColor,
            userRole: 'admin',
            userName: currentUser?.fullName || session.user.name || "Uygulama Yöneticisi",
            availableTenants: envTenantId ? [selectedTenant] : allTenants, // Lock if Strict Mode
            forcePasswordChange: currentUser?.forcePasswordChange ?? false,
            isSuperAdmin: true,
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

    if (envTenantId) {
        // Strict Mode Check
        activeMembership = memberships.find(m => m.tenant.id === envTenantId);
        if (!activeMembership) return null; // User is not a member of the forced tenant
    } else if (tenantIdFromCookie) {
        activeMembership = memberships.find(m => m.tenant.id === tenantIdFromCookie);
    }

    // Fallback: If no cookie or cookie is invalid (user not member of that tenant), use the first one
    if (!activeMembership && !envTenantId) {
        activeMembership = memberships[0];
    }

    if (!activeMembership) return null;

    return {
        tenantId: activeMembership.tenant.id,
        userId: session.user.id,
        tenantName: activeMembership.tenant.longName,
        tenantShortName: activeMembership.tenant.shortName,
        logoUrl: activeMembership.tenant.logoUrl,
        websiteUrl: activeMembership.tenant.websiteUrl,
        primaryColor: activeMembership.tenant.primaryColor,
        userRole: activeMembership.role,
        userName: activeMembership.user.fullName || session.user.name || "Kullanıcı",
        availableTenants: envTenantId ? [activeMembership.tenant] : memberships.map(m => m.tenant),
        forcePasswordChange: activeMembership.user.forcePasswordChange,
        isSuperAdmin: false,
    };
}

export async function getPublicTenantInfo() {
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    
    if (envTenantId) {
        const [tenant] = await db.select().from(tenants).where(eq(tenants.id, envTenantId));
        if (tenant) {
            return {
                tenantName: tenant.longName,
                tenantShortName: tenant.shortName,
                logoUrl: tenant.logoUrl,
                primaryColor: tenant.primaryColor
            };
        }
    }
    
    return {
        tenantName: "Bursta Bugün",
        tenantShortName: "BurstaBugün",
        logoUrl: "/bursiyer-login.jpeg",
        primaryColor: "#2563EB"
    };
}
