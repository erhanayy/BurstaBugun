import { db } from "../lib/db/index";
import { applications, funds } from "../lib/db/schema";
import { eq, or } from "drizzle-orm";

async function main() {
    const firstFund = await db.query.funds.findFirst();
    if (!firstFund) {
        console.log("No fund found!");
        return;
    }

    await db.update(applications)
        .set({ status: 'selected', fundId: firstFund.id })
        .where(or(eq(applications.status, 'in_pool'), eq(applications.status, 'selected')));

    console.log("Updated applications to 'selected' and assigned fundId: " + firstFund.id);
    process.exit(0);
}

main().catch(console.error);
