import { db } from "../lib/db/index";
import { applications, fundSelections } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const apps = await db.query.applications.findMany({
        where: eq(applications.status, 'selected')
    });

    for (const app of apps) {
        if (!app.fundId) continue;

        // check if fundSelections exists
        const existing = await db.query.fundSelections.findFirst({
            where: eq(fundSelections.applicationId, app.id)
        });

        if (!existing) {
            await db.insert(fundSelections).values({
                fundId: app.fundId,
                applicationId: app.id,
                amount: 0,
                paymentType: 'monthly',
                isActive: true
            });
            console.log("Inserted missing fundSelection for application:", app.id);
        }
    }
    process.exit(0);
}

main().catch(console.error);
