'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from "@/lib/db";
import { tenants, users, tenantUsers } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function switchTenant(tenantId: string) {
    const cookieStore = await cookies();
    cookieStore.set('dernekte_tenant_id', tenantId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax'
    });

    // Redirect to dashboard to refresh context
    redirect('/dashboard/home');
}

export async function createTenant(data: { shortName: string, longName: string, primaryColor: string, websiteUrl?: string }) {
    const session = await auth();
    if (!session?.user?.isApplicationAdmin) {
        throw new Error("Unauthorized");
    }

    const [newTenant] = await db.insert(tenants).values({
        shortName: data.shortName,
        longName: data.longName,
        primaryColor: data.primaryColor || '#2563EB',
        websiteUrl: data.websiteUrl || null,
        isActive: true,
    }).returning({ id: tenants.id });

    // Try to find superadmin@bb.com
    let superAdmin = await db.query.users.findFirst({
        where: eq(users.email, 'superadmin@bb.com')
    });

    if (!superAdmin) {
        // Find admin@bb.com to copy password
        const adminUser = await db.query.users.findFirst({
            where: eq(users.email, 'admin@bb.com')
        });

        const [newUser] = await db.insert(users).values({
            fullName: "Vakıf Yöneticisi",
            email: "superadmin@bb.com",
            phoneNumber: "5559998877", // Unique dummy phone
            password: adminUser?.password || "", // Copy hash
            isApplicationAdmin: false,
        }).returning({ id: users.id });
        
        superAdmin = newUser as any;
    }

    // Link user to new tenant
    await db.insert(tenantUsers).values({
        tenantId: newTenant.id,
        userId: superAdmin!.id,
        role: 'admin',
        isActive: true,
    });

    return { success: true };
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.isApplicationAdmin) {
        throw new Error("Unauthorized");
    }

    await db.update(tenants)
        .set({ isActive })
        .where(eq(tenants.id, tenantId));
        
    return { success: true };
}
