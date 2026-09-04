"use server";

import { db } from "../db";
import { payments, mokaTokens, fundSelections, users } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const isProdEnv = process.env.LIVE_ENV === 'true' || process.env.NODE_ENV === 'production';
const MOKA_DEALER_CODE = process.env.MOKA_DEALER_CODE || "206019";
const MOKA_USERNAME = process.env.MOKA_USERNAME || "c4152353-27d3-4dbc-912e-d748bd63c80f";
const MOKA_PASSWORD = process.env.MOKA_PASSWORD || "bc730821-ea91-46d8-8671-55307c13d0a1";
// Test ve Canlı ayrımı
const MOKA_API_URL = process.env.MOKA_API_URL || (isProdEnv ? "https://service.mokaunited.com" : "https://service.testmoka.com");

function createCheckKey() {
    const rawCheckKey = MOKA_DEALER_CODE + "MK" + MOKA_USERNAME + "PD" + MOKA_PASSWORD;
    return crypto.createHash("sha256").update(rawCheckKey).digest("hex");
}

export async function chargeSubscriptionPayments(paymentIds: string[]) {
    try {
        if (!paymentIds || paymentIds.length === 0) {
            return { success: false, error: "Lütfen çekim yapılacak en az bir kayıt seçiniz." };
        }

        // Get the payments with their user and fund details
        const pendingPayments = await db.query.payments.findMany({
            where: inArray(payments.id, paymentIds),
            with: {
                application: {
                    with: {
                        user: true
                    }
                },
                fund: true
            }
        });

        if (pendingPayments.length === 0) {
            return { success: false, error: "Seçilen kayıtlar bulunamadı." };
        }

        let successCount = 0;
        const results = [];

        // Group the payments by userId + fundId + paymentDate (Month-Year)
        const groups = new Map<string, { payments: typeof pendingPayments, amount: number, userId: string, fundId: string, fundTitle: string, isArdaErel: boolean }>();

        // Fetch users to check for Arda Erel exception
        // In decoupled architecture, payment.userId is the sponsor.

        for (const payment of pendingPayments) {
            if (payment.status !== 'pending') {
                results.push({ paymentId: payment.id, success: false, error: "Bu kayıt zaten ödenmiş veya bekleyen durumunda değil." });
                continue;
            }

            const userId = payment.userId;
            if (!userId) {
                results.push({ paymentId: payment.id, success: false, error: "Bu ödemeye ait kullanıcı (sponsor) bulunamadı." });
                continue;
            }

            // We need the user's name for the Arda Erel exception
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId)
            });

            const sponsorName = user?.fullName || '';
            const isArdaErel = sponsorName.toLowerCase().includes('arda erel');

            let groupKey = payment.id; // Default to no grouping for exceptions

            if (!isArdaErel) {
                const monthYear = payment.paymentDate ? `${payment.paymentDate.getFullYear()}-${payment.paymentDate.getMonth()}` : 'unknown';
                groupKey = `${userId}-${payment.fundId}-${monthYear}`;
            }

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    payments: [payment],
                    amount: payment.amount || 0,
                    userId,
                    fundId: payment.fundId,
                    fundTitle: payment.fund?.title || 'Aylık',
                    isArdaErel
                });
            } else {
                const existing = groups.get(groupKey)!;
                existing.payments.push(payment);
                existing.amount += (payment.amount || 0);
            }
        }

        // Now charge per group
        for (const [groupKey, group] of groups.entries()) {
            let tokenCode = "";
            try {
                const cardListPayload = {
                    DealerCustomerAuthentication: {
                        DealerCode: MOKA_DEALER_CODE,
                        Username: MOKA_USERNAME,
                        Password: MOKA_PASSWORD,
                        CheckKey: createCheckKey()
                    },
                    DealerCustomerRequest: {
                        DealerCustomerId: "",
                        CustomerCode: group.userId
                    }
                };
                const cardListRes = await fetch(`${MOKA_API_URL}/DealerCustomer/GetCardList`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cardListPayload)
                });
                if (cardListRes.ok) {
                    const cardListData = await cardListRes.json();
                    if (cardListData.ResultCode === "Success" && cardListData.Data?.CardList?.length > 0) {
                        tokenCode = cardListData.Data.CardList[0].CardToken;
                    }
                }
            } catch (err) {
                console.error("Moka GetCardList Error:", err);
            }

            if (!tokenCode) {
                group.payments.forEach(p => results.push({ paymentId: p.id, success: false, error: "Moka üzerinde bu kullanıcıya ait saklı kart bulunamadı." }));
                continue;
            }

            // Create Moka Request
            const requestPayload = {
                PaymentDealerAuthentication: {
                    DealerCode: MOKA_DEALER_CODE,
                    Username: MOKA_USERNAME,
                    Password: MOKA_PASSWORD,
                    CheckKey: createCheckKey()
                },
                PaymentDealerRequest: {
                    CardHolderFullName: "", // Ignored when using token/CustomerCode
                    CardNumber: "",
                    ExpMonth: "",
                    ExpYear: "",
                    CvcNumber: "",
                    CardToken: tokenCode,
                    Amount: group.amount, // COMBINED AMOUNT
                    Currency: "TL",
                    InstallmentNumber: 1,
                    ClientIP: "127.0.0.1",
                    OtherTrxCode: group.isArdaErel ? `MOKA-SUB-${group.payments[0].id}` : `MOKA-SUB-GRP-${Date.now()}`,
                    SubMerchantName: "",
                    IsPoolPayment: 0,
                    IsTokenized: 0,
                    IntegratorId: 0,
                    Software: "BurstaBugun",
                    Description: group.isArdaErel ? `${group.fundTitle} - Burs Bagisi` : `${group.fundTitle} - Toplu Burs Bagisi`,
                    IsPreAuth: 0
                }
            };

            const response = await fetch(`${MOKA_API_URL}/PaymentDealer/DoDirectPayment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();

            if (data.ResultCode === "Success" && data.Data && data.Data.IsSuccessful) {
                // Payment successful - Update ALL payments in this group
                await db.update(payments)
                    .set({ 
                        status: 'completed',
                        notes: `Aylık Otomatik Çekim Başarılı${group.isArdaErel ? '' : ' (Toplu Çekim)'}. İşlem No: ${data.Data.VirtualPosOrderId || data.Data.trxCode || ''}` 
                    })
                    .where(inArray(payments.id, group.payments.map(p => p.id)));
                
                successCount++;
                group.payments.forEach(p => results.push({ paymentId: p.id, success: true }));
            } else {
                // Payment failed
                console.error("Moka Charge Error:", JSON.stringify(data));
                group.payments.forEach(p => results.push({ paymentId: p.id, success: false, error: data.ResultMessage || data.ResultCode || "Moka işlemi reddetti." }));
            }
        }

        revalidatePath("/dashboard/subscriptions");

        return { 
            success: successCount > 0, 
            message: `${paymentIds.length} işlemden ${successCount} tanesi başarıyla çekildi.${successCount === 0 && results.length > 0 ? ' Hata: ' + results[0].error : ''}`,
            results 
        };

    } catch (error: any) {
        console.error("chargeSubscriptionPayments error:", error);
        return { success: false, error: "İşlem sırasında bir hata oluştu." };
    }
}
