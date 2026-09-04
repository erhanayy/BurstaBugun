"use server";

import { db } from "@/lib/db";
import { fundInvitations, users, fundContributors, funds, payments } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, or, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail, EMAIL_CODES } from "@/lib/email";

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

    const fundObj = await db.query.funds.findFirst({
        where: eq(funds.id, data.fundId)
    });
    const fundNameText = fundObj?.title ? `<strong>"${fundObj.title}"</strong> isimli ` : "bir ";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://burs.fbiadvakfi.org";

    await sendEmail({
        code: EMAIL_CODES.DAVET,
        sentTo: data.inviteeEmail,
        subject: "FBİAD Vakfı - Burs Fonuna Davet Edildiniz",
        screen: "fund_invitation",
        body: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                <h2 style="color: #1a365d; text-align: center;">FBİAD Vakfı Burs Platformu</h2>
                <p>Sayın <strong>${data.inviteeName}</strong>,</p>
                <p>Öğrencilerimizin eğitim hayatına destek olmak amacıyla oluşturduğumuz ${fundNameText}burs fonuna davet edildiniz. Sisteme giriş yaparak davetinizi görüntüleyebilir ve geleceğimiz olan gençlere destek olabilirsiniz.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}" style="background-color: #1a365d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Sisteme Giriş Yap</a>
                </div>
                <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">
                    Eğer bu e-postayı yanlışlıkla aldığınızı düşünüyorsanız, lütfen dikkate almayınız.
                </p>
            </div>
        `
    });

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

        if (ext) {
            await db.update(fundContributors)
                .set({ studentCount: studentCount })
                .where(eq(fundContributors.id, ext.id));
            
            // Difference in student count if they are changing it
            const diff = studentCount - (ext.studentCount || 1);
            if (diff !== 0) {
                await db.update(funds)
                    .set({ targetStudentCount: sql`${funds.targetStudentCount} + ${diff}` })
                    .where(eq(funds.id, inv.fundId));
            }
        } else {
            await db.insert(fundContributors).values({
                fundId: inv.fundId,
                userId: tenantData.userId,
                amount: inv.fund.monthlyLimit || 0,
                studentCount: studentCount
            });
            
            // Increase total capacity of the fund by the new studentCount
            await db.update(funds)
                .set({ targetStudentCount: sql`${funds.targetStudentCount} + ${studentCount}` })
                .where(eq(funds.id, inv.fundId));
        }
    }

    revalidatePath("/dashboard/invitations");
    revalidatePath("/dashboard/funds");

    return { success: true };
}

export async function cancelFundSelectionAndResetInvitation(fundId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    // Check if any payments are already completed for this user in this fund
    const completedPayments = await db.query.payments.findFirst({
        where: (p, { and, eq }) => and(
            eq(p.fundId, fundId),
            eq(p.userId, tenantData.userId),
            eq(p.status, "completed")
        )
    });

    if (completedPayments) {
        throw new Error("Ödemesi başlamış veya tamamlanmış katılımlar iptal edilemez. Lütfen yönetici ile iletişime geçin.");
    }

    const contributor = await db.query.fundContributors.findFirst({
        where: and(
            eq(fundContributors.fundId, fundId),
            eq(fundContributors.userId, tenantData.userId)
        )
    });

    if (contributor) {
        // Remove from contributors
        await db.delete(fundContributors)
            .where(eq(fundContributors.id, contributor.id));

        // Decrease the fund's targetStudentCount
        await db.update(funds)
            .set({ targetStudentCount: sql`${funds.targetStudentCount} - ${contributor.studentCount}` })
            .where(eq(funds.id, fundId));
    }

    // Reset the invitation status back to pending
    const invitation = await db.query.fundInvitations.findFirst({
        where: (inv, { and, eq }) => and(
            eq(inv.fundId, fundId),
            eq(inv.inviteeId, tenantData.userId),
            eq(inv.status, "accepted")
        )
    });

    if (invitation) {
        await db.update(fundInvitations)
            .set({ status: "pending", updatedAt: new Date() })
            .where(eq(fundInvitations.id, invitation.id));
    }

    // Optional: Delete pending payments
    await db.delete(payments).where(and(
        eq(payments.fundId, fundId),
        eq(payments.userId, tenantData.userId),
        eq(payments.status, "pending")
    ));

    revalidatePath("/dashboard/invitations");
    revalidatePath(`/dashboard/funds/${fundId}/payment`);
    revalidatePath("/dashboard/funds");

    return { success: true };
}
