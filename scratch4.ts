import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";
// Mock getCurrentTenant and auth
import * as tenant from "./lib/data/tenant";
import * as authObj from "./auth";
import { createPaymentSession } from "./lib/actions/payment-session";

// @ts-ignore
tenant.getCurrentTenant = async () => ({ userId: '4c6dcda7-d0d4-4b53-8445-6be54556488d', tenantId: 'cfc00202-11c1-48dd-ae63-35fd44c60977' });
// @ts-ignore
authObj.auth = async () => ({ user: { name: 'Erhan Ayyıldız' } });

async function run() {
    const res = await createPaymentSession('7aec695c-472d-4eb5-956e-f0751fd75b95');
    console.log(res);
    // decode token
    if (res.url) {
        const token = new URL(res.url).searchParams.get('token');
        if (token) {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            console.log("PAYLOAD:");
            console.log(payload);
        }
    }
}
run();
