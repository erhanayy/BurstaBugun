const MOKA_API_URL = "https://service.mokaunited.com";
const endpoints = [
    "/PaymentDealer/GetCustomerCardList",
    "/DealerCustomer/GetCustomerCardList",
    "/PaymentDealerCustomer/GetCustomerCardList",
    "/PaymentDealer/GetCardList",
    "/PaymentDealer/CustomerCardList",
    "/Customer/GetCustomerCardList",
    "/CustomerCard/GetCustomerCardList"
];

async function test() {
    for (const ep of endpoints) {
        const res = await fetch(MOKA_API_URL + ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        console.log(ep, res.status);
    }
}
test();
