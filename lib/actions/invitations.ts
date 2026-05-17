"use server";

import { db } from "@/lib/db";
import { fundInvitations, users, fundContributors, fundSelections } from "@/lib/db/schema";
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
    revalidatePath(`/dashboard/invitations`);

    return { success: true };
}

export async function respondToInvitation(invitationId: string, status: "accepted" | "rejected", studentCount: number = 1) {
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
        // Enforce capacity rule
        const contributors = await db.query.fundContributors.findMany({
            where: (fc, { and, eq }) => and(
                eq(fc.fundId, inv.fundId),
                eq(fc.isActive, true)
            )
        });

        const ext = contributors.find(c => c.userId === tenantData.userId);
        
        let currentTotal = contributors.reduce((sum, c) => sum + (c.studentCount || 1), 0);
        if (ext) {
            currentTotal -= (ext.studentCount || 1);
        }

        const targetCount = inv.fund.targetStudentCount;

        if (targetCount !== null && targetCount !== undefined && targetCount > 0) {
            if (currentTotal + studentCount > targetCount) {
                const available = targetCount - currentTotal;
                if (available <= 0) {
                    throw new Error("Bu fonun kapasitesi dolmuştur.");
                } else {
                    throw new Error(`Bu fonda sadece ${available} kişilik açık kontenjan kalmıştır.`);
                }
            }
        }

        if (ext) {
            await db.update(fundContributors)
                .set({ studentCount: studentCount })
                .where(eq(fundContributors.id, ext.id));
        } else {
            await db.insert(fundContributors).values({
                fundId: inv.fundId,
                userId: tenantData.userId,
                amount: inv.fund.monthlyLimit || 0,
                studentCount: studentCount
            });
        }

        // Assign students to this sponsor permanently
        const userSelections = await db.query.fundSelections.findMany({
            where: (fs, { and, eq }) => and(
                eq(fs.fundId, inv.fundId),
                eq(fs.sponsorId, tenantData.userId)
            ),
            orderBy: (fs, { asc }) => [asc(fs.createdAt)]
        });

        const currentAssignedCount = userSelections.length;
        const diff = studentCount - currentAssignedCount;

        if (diff > 0) {
            const availableSelections = await db.query.fundSelections.findMany({
                where: (fs, { and, eq, isNull }) => and(
                    eq(fs.fundId, inv.fundId),
                    isNull(fs.sponsorId)
                ),
                orderBy: (fs, { asc }) => [asc(fs.createdAt)],
                limit: diff
            });

            for (const sel of availableSelections) {
                await db.update(fundSelections)
                    .set({ sponsorId: tenantData.userId })
                    .where(eq(fundSelections.id, sel.id));
            }
        } else if (diff < 0) {
            const toUnassign = userSelections.slice(0, Math.abs(diff));
            for (const sel of toUnassign) {
                await db.update(fundSelections)
                    .set({ sponsorId: null })
                    .where(eq(fundSelections.id, sel.id));
            }
        }
    }

    revalidatePath("/dashboard/invitations");
    revalidatePath("/dashboard/funds");

    return { success: true };
}
