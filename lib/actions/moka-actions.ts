"use server";

import { db } from "../db";
import { payments, mokaTokens, fundSelections } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const MOKA_DEALER_CODE = process.env.MOKA_DEALER_CODE || "206019";
const MOKA_USERNAME = process.env.MOKA_USERNAME || "c4152353-27d3-4dbc-912e-d748bd63c80f";
const MOKA_PASSWORD = process.env.MOKA_PASSWORD || "bc730821-ea91-46d8-8671-55307c13d0a1";
const MOKA_API_URL = process.env.MOKA_API_URL || "https://service.mokaunited.com";

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

        for (const payment of pendingPayments) {
            if (payment.status !== 'pending') {
                results.push({ paymentId: payment.id, success: false, error: "Bu kayıt zaten ödenmiş veya bekleyen durumunda değil." });
                continue;
            }

            // Find the sponsor for this payment
            const selection = await db.query.fundSelections.findFirst({
                where: and(
                    eq(fundSelections.fundId, payment.fundId),
                    eq(fundSelections.applicationId, payment.applicationId),
                    eq(fundSelections.isActive, true)
                )
            });

            const userId = selection?.sponsorId;
            if (!userId) {
                results.push({ paymentId: payment.id, success: false, error: "Bu ödemeye ait bursveren (sponsor) bulunamadı." });
                continue;
            }

            // Fetch the user's Moka Card Token dynamically from Moka
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
                        CustomerCode: userId
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
                results.push({ paymentId: payment.id, success: false, error: "Moka üzerinde bu kullanıcıya ait saklı kart bulunamadı." });
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
                    Amount: payment.amount,
                    Currency: "TL",
                    InstallmentNumber: 1,
                    ClientIP: "127.0.0.1",
                    OtherTrxCode: `MOKA-SUB-${payment.id}`,
                    SubMerchantName: "",
                    IsPoolPayment: 0,
                    IsTokenized: 0, // MUST BE 0 WHEN USING A TOKEN. 1 means "Save New Card"
                    IntegratorId: 0,
                    Software: "BurstaBugun",
                    Description: `${payment.fund?.title || 'Aylık'} - Burs Bagisi`,
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
                // Payment successful
                await db.update(payments)
                    .set({ 
                        status: 'completed',
                        notes: `Aylık Otomatik Çekim Başarılı (Moka Non-3D). İşlem No: ${data.Data.VirtualPosOrderId || data.Data.trxCode || ''}` 
                    })
                    .where(eq(payments.id, payment.id));
                
                successCount++;
                results.push({ paymentId: payment.id, success: true });
            } else {
                // Payment failed
                console.error("Moka Charge Error:", JSON.stringify(data));
                results.push({ paymentId: payment.id, success: false, error: data.ResultMessage || data.ResultCode || "Moka işlemi reddetti." });
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
