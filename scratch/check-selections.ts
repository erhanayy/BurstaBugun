import { db } from "../lib/db";
import { fundSelections } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const sels = await db.query.fundSelections.findMany({
        limit: 5,
        with: {
            fund: true,
            application: {
                with: {
                    user: true
                }
            }
        }
    });
    console.log(JSON.stringify(sels, null, 2));
    process.exit(0);
}
main().catch(console.error);
