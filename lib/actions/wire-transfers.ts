'use server'

import { db } from "@/lib/db";
import { payments, applications, fundSelections, fundContributors, funds } from "@/lib/db/schema";
import { eq, and, isNotNull, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notification";

export async function getPendingWireTransfers(tenantId: string) {
    try {
        const pendingPayments = await db.query.payments.findMany({
            where: and(
                eq(payments.tenantId, tenantId),
                eq(payments.status, 'pending'),
                isNotNull(payments.receiptUrl)
            ),
            with: {
                fund: true,
                application: {
                    with: {
                        user: true
                    }
                }
            },
            orderBy: (p, { desc }) => [desc(p.createdAt)]
        });
        const grouped = pendingPayments.reduce((acc, p) => {
            const key = p.receiptUrl || p.id;
            if (!acc[key]) {
                acc[key] = {
                    id: key,
                    receiptUrl: p.receiptUrl,
                    fund: p.fund,
                    application: p.application,
                    createdAt: p.createdAt,
                    totalAmount: 0,
                    paymentIds: []
                };
            }
            acc[key].totalAmount += (p.amount || 0);
            acc[key].paymentIds.push(p.id);
            return acc;
        }, {} as Record<string, any>);
        
        const groupedData = Object.values(grouped).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return { success: true, data: groupedData };
    } catch (e) {
        console.error("Error fetching wire transfers:", e);
        return { success: false, error: "Hatali islem" };
    }
}

export async function approveWireTransfer(paymentIds: string[]) {
    try {
        if (!paymentIds || paymentIds.length === 0) return { success: false, error: "Ödeme bulunamadı" };

        const payment = await db.query.payments.findFirst({
            where: eq(payments.id, paymentIds[0]),
            with: { fund: true }
        });

        if (!payment) return { success: false, error: "Ödeme bulunamadı" };

        await db.update(payments)
            .set({ 
                status: 'completed',
                notes: payment.notes ? payment.notes + " (Yönetici Onaylı)" : "Yönetici tarafından Havale/EFT onaylandı"
            })
            .where(inArray(payments.id, paymentIds));

        // Mark contributor as paid
        if (payment.fund) {
            const contributors = await db.query.fundContributors.findMany({
                where: eq(fundContributors.fundId, payment.fundId)
            });

            if (contributors.length > 0) {
                await db.update(fundContributors)
                    .set({ isPaid: true })
                    .where(eq(fundContributors.fundId, payment.fundId));
            } else {
                await db.insert(fundContributors).values({
                    fundId: payment.fundId,
                    userId: payment.fund.ownerId,
                    amount: 0,
                    isPaid: true
                });
            }

            // Activate applications
            const appsToActivate = await db.query.applications.findMany({
                where: and(
                    eq(applications.fundId, payment.fundId),
                    eq(applications.status, 'selected')
                )
            });

            if (appsToActivate.length > 0) {
                await db.update(applications)
                  .set({ status: 'active' })
                  .where(and(eq(applications.fundId, payment.fundId), eq(applications.status, 'selected')));

                for (const app of appsToActivate) {
                   await createNotification(
                      app.tenantId,
                      [app.userId],
                      'application',
                      'Tebrikler! Bursa Seçildiniz 🎉',
                      `Başvurunuz onaylandı ve bir burs fonuna atandınız. İlk tahsilat başarıyla yapıldı. Öğrenim döneminiz boyunca ödemeleriniz gerçekleşecektir.`
                   ).catch(e => console.error("Notification failed", e));
                }
            }
        }

        revalidatePath('/dashboard/wire-transfers');
        return { success: true };
    } catch (e) {
        console.error("Error approving wire transfer:", e);
        return { success: false, error: "Sistem hatası" };
    }
}

export async function rejectWireTransfer(paymentIds: string[]) {
    try {
        if (!paymentIds || paymentIds.length === 0) return { success: false, error: "Ödeme bulunamadı" };

        await db.update(payments)
            .set({ 
                status: 'failed',
                notes: "Havale/EFT Yönetici tarafından reddedildi."
            })
            .where(inArray(payments.id, paymentIds));

        revalidatePath('/dashboard/wire-transfers');
        return { success: true };
    } catch (e) {
        console.error("Error rejecting wire transfer:", e);
        return { success: false, error: "Sistem hatası" };
    }
}
