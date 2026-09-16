"use server";

import { db } from "@/lib/db";
import { users, payments, funds, fundContributors, tenantUsers, donations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitManualPayment(data: any, tenantId: string) {
    try {
        let userId = data.userId;

        // Auto-lookup by email or phone if userId is missing
        if (!userId) {
            let existingUser = null;

            if (data.newUserEmail) {
                existingUser = await db.query.users.findFirst({
                    where: eq(users.email, data.newUserEmail.toLowerCase())
                });
            }

            if (!existingUser && data.newUserPhone) {
                existingUser = await db.query.users.findFirst({
                    where: and(
                        eq(users.phoneNumber, data.newUserPhone),
                        eq(users.tenantId, tenantId)
                    )
                });
            }

            if (existingUser) {
                userId = existingUser.id;
            } else {
                const dummyPhone = `0000${Math.floor(100000 + Math.random() * 900000)}`;
                const [newUser] = await db.insert(users).values({
                    tenantId,
                    email: data.newUserEmail.toLowerCase(),
                    phoneNumber: data.newUserPhone || dummyPhone,
                    fullName: data.newUserName,
                    password: 'shadow_user',
                }).returning({ id: users.id });
                userId = newUser.id;

                await db.insert(tenantUsers).values({
                    tenantId,
                    userId,
                    role: 'sponsor'
                });
            }
        }
        
        if (!userId) throw new Error("Bağışçı bilgisi eksik.");
        await db.insert(payments).values({
            tenantId,
            fundId: data.fundId,
            userId: userId,
            amount: data.amount,
            status: 'completed',
            paymentMethod: 'wire_transfer',
            paymentDate: new Date(data.paymentDate),
            notes: data.notes || "Manuel EFT/Havale tahsilatı"
        });

        // Also add to donations table so it shows up in Web Bağış
        await db.insert(donations).values({
            tenantId,
            fundId: data.fundId, // Added fundId to link donation to the mega fund
            amount: data.amount,
            donorName: data.newUserName,
            donorEmail: data.newUserEmail,
            donorPhone: data.newUserPhone,
            paymentMethod: 'wire_transfer',
            status: 'completed',
            isAnonymous: false,
            isFbiadMember: false,
            wantsMembershipInfo: false,
            agreementsAccepted: true,
            createdAt: new Date(data.paymentDate), // Match the payment date for filtering
        });

        // Add or update contributor in Mega Fund
        const existingContributor = await db.query.fundContributors.findFirst({
            where: and(
                eq(fundContributors.fundId, data.fundId),
                eq(fundContributors.userId, userId)
            )
        });

        if (existingContributor) {
            // Update amount if needed, though amount is just a snapshot, we sum from payments
            await db.update(fundContributors)
                .set({ 
                    amount: existingContributor.amount + data.amount,
                    studentCount: data.studentCountTarget > 0 ? data.studentCountTarget : existingContributor.studentCount,
                    supporterType: data.supporterType || 'recurring'
                })
                .where(eq(fundContributors.id, existingContributor.id));
        } else {
            await db.insert(fundContributors).values({
                fundId: data.fundId,
                userId: userId,
                amount: data.amount,
                studentCount: data.studentCountTarget || 0,
                supporterType: data.supporterType || 'recurring',
                isPaid: true
            });
        }

        // Update Fund total collected amount
        const targetFund = await db.query.funds.findFirst({
            where: eq(funds.id, data.fundId)
        });

        if (targetFund) {
            await db.update(funds)
                .set({ collectedAmount: targetFund.collectedAmount + data.amount })
                .where(eq(funds.id, data.fundId));
        }

        revalidatePath(`/dashboard/funds/${data.fundId}`);
        revalidatePath('/dashboard/admin/payments/new');

        return { success: true };
    } catch (error: any) {
        console.error("Manual Payment Error:", error);
        return { success: false, error: error.message };
    }
}
