"use server";

import { db } from "@/lib/db";
import { fundInvitations, users, fundContributors, fundSelections, funds } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, or, and } from "drizzle-orm";
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
    const fundNameText = fundObj?.name ? `<strong>"${fundObj.name}"</strong> isimli ` : "bir ";

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

export async function cancelFundSelectionAndResetInvitation(fundId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    // Check if any payments are already completed for this user in this fund
    const userSelections = await db.query.fundSelections.findMany({
        where: (fs, { and, eq }) => and(
            eq(fs.fundId, fundId),
            eq(fs.sponsorId, tenantData.userId)
        )
    });

    if (userSelections.length === 0) {
        throw new Error("İptal edilecek bir seçim bulunamadı.");
    }

    const appIds = userSelections.map(s => s.applicationId);

    const completedPayments = await db.query.payments.findFirst({
        where: (p, { and, eq, inArray }) => and(
            eq(p.fundId, fundId),
            inArray(p.applicationId, appIds),
            eq(p.status, "completed")
        )
    });

    if (completedPayments) {
        throw new Error("Ödemesi başlamış veya tamamlanmış seçimler iptal edilemez. Lütfen yönetici ile iletişime geçin.");
    }

    // 1. Release the locked students back to the pool
    for (const sel of userSelections) {
        await db.update(fundSelections)
            .set({ sponsorId: null })
            .where(eq(fundSelections.id, sel.id));
    }

    // 2. Remove from contributors
    await db.delete(fundContributors)
        .where(and(
            eq(fundContributors.fundId, fundId),
            eq(fundContributors.userId, tenantData.userId)
        ));

    // 3. Reset the invitation status back to pending
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

    revalidatePath("/dashboard/invitations");
    revalidatePath(`/dashboard/funds/${fundId}/payment`);
    revalidatePath("/dashboard/funds");

    return { success: true };
}
