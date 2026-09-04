const payload = {
  fundId: "d7a6ab69-115d-4e27-b34b-10d4b5d604f0",
  transactionId: "WIRE-TEST-" + Date.now(),
  paymentIds: ["625499ab-9fc5-47bd-9e8e-be75ee6b036f"], // Random valid payment ID from before
  paymentMethod: 'wire_transfer',
  receiptUrl: "https://example.com/receipt.jpg"
};

fetch('http://localhost:3005/api/app-payment/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(res => res.json()).then(console.log).catch(console.error);
