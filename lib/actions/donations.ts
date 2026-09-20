"use server";

import { db } from "@/lib/db";
import { donations, users, payments, funds, fundContributors, tenantUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";

export async function updateDonationStatus(donationId: string, status: 'completed' | 'failed' | 'pending') {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return { success: false, error: "Yetkisiz işlem." };
    }

    try {
        await db.update(donations)
            .set({ status })
            .where(
                and(
                    eq(donations.id, donationId),
                    eq(donations.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/donations");
        return { success: true };
    } catch (error: any) {
        console.error("updateDonationStatus error:", error);
        return { success: false, error: "İşlem sırasında bir hata oluştu." };
    }
}

export async function assignDonationToFund(
    donationId: string, 
    fundId: string, 
    supporterType: string = 'recurring',
    selectedUserId?: string | null,
    createNewUser?: boolean
) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || !['admin', 'superadmin'].includes(tenantData.userRole) && !tenantData.isSuperAdmin) {
        return { success: false, error: "Yetkisiz işlem." };
    }

    try {
        const donation = await db.query.donations.findFirst({
            where: and(
                eq(donations.id, donationId),
                eq(donations.tenantId, tenantData.tenantId)
            )
        });

        if (!donation) return { success: false, error: "Bağış bulunamadı." };
        if (donation.fundId && donation.status === 'completed') return { success: false, error: "Bu bağış zaten onaylanmış ve bir fona atanmış." };

        let userId = selectedUserId || null;

        // Try to find user by email or phone if not provided and not strictly creating new
        if (!userId && !createNewUser) {
            if (donation.donorEmail) {
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.email, donation.donorEmail.toLowerCase())
                });
                if (existingUser) userId = existingUser.id;
            }

            if (!userId && donation.donorPhone) {
                const existingUser = await db.query.users.findFirst({
                    where: and(
                        eq(users.phoneNumber, donation.donorPhone),
                        eq(users.tenantId, tenantData.tenantId)
                    )
                });
                if (existingUser) userId = existingUser.id;
            }
        }

        // If no user found and createNewUser is true, or just no user found at all
        if (!userId) {
            if (!createNewUser) {
                return { success: false, error: "Bu bağışçı sistemde bulunamadı. Lütfen yeni kullanıcı oluştur seçeneğini işaretleyin." };
            }
            const dummyPhone = `0000${Math.floor(100000 + Math.random() * 900000)}`;
            const [newUser] = await db.insert(users).values({
                tenantId: tenantData.tenantId,
                email: donation.donorEmail?.toLowerCase() || null,
                phoneNumber: donation.donorPhone || dummyPhone,
                fullName: donation.donorName || 'İsimsiz Bağışçı',
                password: 'shadow_user',
            }).returning({ id: users.id });
            userId = newUser.id;

            await db.insert(tenantUsers).values({
                tenantId: tenantData.tenantId,
                userId,
                role: 'sponsor' // Default role for new donors
            });
        }

        // Akıllı Taksit Eşleştirme (Smart Payment Allocation)
        let remainingAmount = donation.amount;

        // Find all pending payments for this user and fund, ordered by date
        const pendingPayments = await db.query.payments.findMany({
            where: and(
                eq(payments.userId, userId),
                eq(payments.fundId, fundId),
                eq(payments.status, 'pending')
            ),
            orderBy: (p, { asc }) => [asc(p.paymentDate)]
        });

        for (const p of pendingPayments) {
            if (remainingAmount >= p.amount) {
                // Tamamen karşılıyor
                await db.update(payments)
                    .set({ 
                        status: 'completed', 
                        donationId: donation.id,
                        paymentMethod: donation.paymentMethod,
                        notes: (p.notes ? p.notes + ' | ' : '') + `Web üzerinden gelen bağış ile eşleşti.`
                    })
                    .where(eq(payments.id, p.id));
                remainingAmount -= p.amount;
            } else if (remainingAmount > 0) {
                // Kısmi karşılama durumunda taksidi bölmüyoruz. O taksit pending kalıyor.
                // Kalan parayı en sona ek bir ödeme olarak atacağız.
                break;
            } else {
                break;
            }
        }

        // Eğer eşleştirmelerden sonra elde para kaldıysa (veya hiç pending taksit yoksa),
        // kalan tutar için yeni bir "completed" ödeme satırı oluşturuyoruz.
        if (remainingAmount > 0) {
            await db.insert(payments).values({
                tenantId: tenantData.tenantId,
                fundId,
                userId,
                donationId: donation.id,
                amount: remainingAmount,
                status: 'completed',
                paymentMethod: donation.paymentMethod,
                paymentDate: donation.createdAt,
                notes: `Web üzerinden gelen ${donation.paymentMethod === 'wire_transfer' ? 'EFT/Havale' : 'Kredi Kartı'} ödemesi (veya artan bakiye). Bağış ID: ${donation.id}`
            });
        }

        // Update fundContributors
        const existingContributor = await db.query.fundContributors.findFirst({
            where: and(
                eq(fundContributors.fundId, fundId),
                eq(fundContributors.userId, userId)
            )
        });

        if (existingContributor) {
            await db.update(fundContributors)
                .set({ 
                    amount: existingContributor.amount + donation.amount,
                    supporterType: supporterType
                })
                .where(eq(fundContributors.id, existingContributor.id));
        } else {
            await db.insert(fundContributors).values({
                fundId,
                userId,
                amount: donation.amount,
                studentCount: 0,
                supporterType: supporterType,
                isPaid: true
            });
        }

        // Update Fund total
        const targetFund = await db.query.funds.findFirst({
            where: eq(funds.id, fundId)
        });
        if (targetFund) {
            await db.update(funds)
                .set({ collectedAmount: targetFund.collectedAmount + donation.amount })
                .where(eq(funds.id, fundId));
        }

        // Finally, update the donation record with the assigned fund and mark as completed
        await db.update(donations)
            .set({ fundId, status: 'completed' })
            .where(eq(donations.id, donationId));

        revalidatePath("/dashboard/admin/donations");
        revalidatePath(`/dashboard/funds/${fundId}`);
        return { success: true };
    } catch (error: any) {
        console.error("assignDonationToFund error:", error);
        return { success: false, error: "İşlem sırasında bir hata oluştu." };
    }
}
