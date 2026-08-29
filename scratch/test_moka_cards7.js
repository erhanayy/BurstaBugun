const crypto = require("crypto");
const MOKA_DEALER_CODE = "206019";
const MOKA_USERNAME = "c4152353-27d3-4dbc-912e-d748bd63c80f";
const MOKA_PASSWORD = "bc730821-ea91-46d8-8671-55307c13d0a1";
const MOKA_API_URL = "https://service.mokaunited.com";
const customerCode = "6db8eece-6bd8-4191-8df4-60def0978c81";
const cardToken = "f9aa63f3-6593-4383-8f51-68309b97b765";

function createCheckKey() {
    const rawCheckKey = MOKA_DEALER_CODE + "MK" + MOKA_USERNAME + "PD" + MOKA_PASSWORD;
    return crypto.createHash("sha256").update(rawCheckKey).digest("hex");
}

async function doPayment() {
    const payload = {
        PaymentDealerAuthentication: {
            DealerCode: MOKA_DEALER_CODE,
            Username: MOKA_USERNAME,
            Password: MOKA_PASSWORD,
            CheckKey: createCheckKey()
        },
        PaymentDealerRequest: {
            CardHolderFullName: "",
            CardNumber: "",
            ExpMonth: "",
            ExpYear: "",
            CvcNumber: "",
            CardToken: cardToken, // USING THE REAL TOKEN
            Amount: 1,
            Currency: "TL",
            InstallmentNumber: 1,
            ClientIP: "178.233.120.251", // User's IP from earlier logs to avoid IP whitelist issue if possible, wait, local machine might still get IP blocked.
            OtherTrxCode: "MOKA-TEST-" + Date.now(),
            IsPoolPayment: 0,
            IsTokenized: 1,
            IntegratorId: 0,
            Software: "BurstaBugun",
            Description: "Abonelik Test",
            IsPreAuth: 0
        }
    };

    const response = await fetch(`${MOKA_API_URL}/PaymentDealer/DoDirectPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
}
doPayment().catch(console.error);
