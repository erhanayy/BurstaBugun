import { db } from "../lib/db/index";
import { applications, fundSelections, payments } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const apps = await db.query.applications.findMany({
        where: eq(applications.status, 'selected'),
        orderBy: (applications, { asc }) => [asc(applications.createdAt)]
    });

    if (apps.length > 1) {
        const oldestApp = apps[0];

        // Remove related fund selections and payments if any, to avoid foreign key issues
        await db.delete(payments).where(eq(payments.applicationId, oldestApp.id));
        await db.delete(fundSelections).where(eq(fundSelections.applicationId, oldestApp.id));

        await db.update(applications)
            .set({ status: 'waiting_reference' })
            .where(eq(applications.id, oldestApp.id));

        console.log("Reverted older application to 'waiting_reference':", oldestApp.id);
    } else {
        console.log("Found less than 2 selected applications. Nothing to do.");
    }
    process.exit(0);
}

main().catch(console.error);
