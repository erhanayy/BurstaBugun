import { db } from "../lib/db";
import { applications, fundSelections, references, tenants } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";

async function run() {
    try {
        const tenant = await db.query.tenants.findFirst();
        if (!tenant) throw new Error("No tenant");
        
        console.log("Fetching waiting_reference for tenant", tenant.id);
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.tenantId, tenant.id),
                eq(applications.status, "waiting_reference")
            ),
            with: {
                user: true,
                references: {
                    where: eq(references.status, "pending")
                },
                fund: {
                    with: { owner: true }
                },
                selections: {
                    where: eq(fundSelections.isActive, true),
                    with: {
                        fund: { with: { owner: true } }
                    }
                }
            }
        });
        console.log(`Found ${apps.length} apps`);
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
    }
    process.exit(0);
}
run();
