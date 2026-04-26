import { db } from "../lib/db";
import { funds, payments } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const muhsin = await db.query.funds.findFirst({
        where: eq(funds.title, 'Muhsin Ayyıldız Fonu')
    });
    console.log("Muhsin Fund Details:", {
        id: muhsin?.id,
        startDate: muhsin?.startDate,
        durationMonths: muhsin?.durationMonths,
        monthlyLimit: muhsin?.monthlyLimit
    });

    if (muhsin) {
        const pmts = await db.query.payments.findMany({
            where: eq(payments.fundId, muhsin.id)
        });
        console.log("Payments for this fund:", pmts.length);
    }
    process.exit(0);
}

main().catch(console.error);
