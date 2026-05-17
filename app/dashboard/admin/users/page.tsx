import { redirect } from "next/navigation";
import { getCurrentTenant } from "@/lib/data/tenant";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenantUsers, users, loginLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import UsersClient from "./users-client";

export default async function AdminUsersPage() {
    const session = await auth();
    const tenantData = await getCurrentTenant();

    if (!session?.user || !tenantData) {
        redirect("/login");
    }

    // Only Admin or Super Admin can access this
    const userRole = tenantData.userRole;
    if (userRole !== 'admin' && !tenantData.isSuperAdmin) {
        redirect("/dashboard");
    }

    // Fetch tenant users with their user details
    const rawTenantUsers = await db.query.tenantUsers.findMany({
        where: eq(tenantUsers.tenantId, tenantData.tenantId),
        with: {
            user: true
        }
    });

    // Fetch the latest login log for each user in this tenant
    // Alternatively, we can group by user or fetch recent logs, but for simplicity we fetch loginLogs for the tenant
    const recentLogins = await db.query.loginLogs.findMany({
        where: eq(loginLogs.tenantId, tenantData.tenantId),
        orderBy: [desc(loginLogs.loggedInAt)]
    });

    // Create a map for quick latest login lookup
    const lastLoginMap = new Map<string, Date>();
    for (const log of recentLogins) {
        if (!lastLoginMap.has(log.userId)) {
            lastLoginMap.set(log.userId, log.loggedInAt);
        }
    }

    // Format the data for the client
    const formattedUsers = rawTenantUsers.map(tu => ({
        id: tu.user.id,
        fullName: tu.user.fullName || "Bilinmeyen İsim",
        email: tu.user.email,
        phone: tu.user.phoneNumber,
        role: tu.role,
        isActive: tu.user.isActive && tu.isActive,
        createdAt: tu.user.createdAt.toISOString(),
        lastLoginAt: lastLoginMap.get(tu.user.id)?.toISOString() || null
    })).sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr-TR'));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pt-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kullanıcı Bilgileri</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Bu kurum altındaki tüm kullanıcıları görüntüleyebilir ve filtreleyebilirsiniz.
                </p>
            </div>

            <UsersClient initialUsers={formattedUsers} />
        </div>
    );
}
