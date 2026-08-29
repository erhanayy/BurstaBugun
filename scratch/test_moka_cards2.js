const crypto = require("crypto");

const MOKA_DEALER_CODE = "206019";
const MOKA_USERNAME = "c4152353-27d3-4dbc-912e-d748bd63c80f";
const MOKA_PASSWORD = "bc730821-ea91-46d8-8671-55307c13d0a1";
const MOKA_API_URL = "https://service.mokaunited.com";
const customerCode = "1fef1b24-9b2f-410a-b365-5eb7dbd48600"; // User ID

function createCheckKey() {
    const rawCheckKey = MOKA_DEALER_CODE + "MK" + MOKA_USERNAME + "PD" + MOKA_PASSWORD;
    return crypto.createHash("sha256").update(rawCheckKey).digest("hex");
}

async function getCards() {
    const payload = {
        DealerCustomerAuthentication: {
            DealerCode: MOKA_DEALER_CODE,
            Username: MOKA_USERNAME,
            Password: MOKA_PASSWORD,
            CheckKey: createCheckKey()
        },
        DealerCustomerRequest: {
            CustomerCode: customerCode
        }
    };

    console.log("Request:", JSON.stringify(payload));
    const response = await fetch(`${MOKA_API_URL}/DealerCustomer/GetCustomerCardList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
}

getCards().catch(console.error);
