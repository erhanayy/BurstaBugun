"use server";

import { db } from "@/lib/db";
import { fundInvitations, users, fundContributors } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendFundInvitation(data: {
    fundId: string;
    inviteeName: string;
    inviteeEmail: string;
    inviteePhone: string;
}) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    // Check if the user is already registered in the system
    const existingUser = await db.query.users.findFirst({
        where: or(
            eq(users.email, data.inviteeEmail),
            data.inviteePhone ? eq(users.phoneNumber, data.inviteePhone) : undefined
        )
    });

    await db.insert(fundInvitations).values({
        fundId: data.fundId,
        inviterId: tenantData.userId,
        inviteeId: existingUser?.id || null, // Map immediately if known
        inviteeName: data.inviteeName,
        inviteeEmail: data.inviteeEmail,
        inviteePhone: data.inviteePhone,
        role: "bursiyer", // Hardcoded per user request (User registers and picks later)
        status: "pending"
    });

    // TODO: Send Email using your email provider here

    revalidatePath(`/dashboard/funds/${data.fundId}`);

    return { success: true };
}

export async function respondToInvitation(invitationId: string, status: "accepted" | "rejected") {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const inv = await db.query.fundInvitations.findFirst({
        where: eq(fundInvitations.id, invitationId),
        with: { fund: true }
    });

    if (!inv) throw new Error("Davetiye bulunamadı.");

    await db.update(fundInvitations)
        .set({ status, updatedAt: new Date() })
        .where(eq(fundInvitations.id, invitationId));

    // If accepted and the user is a sponsor, auto-add them to the contributors
    if (status === "accepted" && (tenantData.userRole === "sponsor" || tenantData.userRole === "admin")) {
        const ext = await db.query.fundContributors.findFirst({
            where: (fc, { and, eq }) => and(
                eq(fc.fundId, inv.fundId),
                eq(fc.userId, tenantData.userId)
            )
        });

        if (!ext) {
            await db.insert(fundContributors).values({
                fundId: inv.fundId,
                userId: tenantData.userId,
                amount: inv.fund.monthlyLimit || 0
            });
        }
    }

    revalidatePath("/dashboard/invitations");
    revalidatePath("/dashboard/funds");

    return { success: true };
}
