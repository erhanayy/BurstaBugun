import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { applications, fundSelections, references } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema, logger: true });

async function run() {
    try {
        console.log("Fetching waiting_reference...");
        const apps = await db.query.applications.findMany({
            where: and(
                eq(applications.tenantId, "fbiad"), // Use typical tenantId or whatever
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
        console.error(e);
    }
    process.exit(0);
}
run();
