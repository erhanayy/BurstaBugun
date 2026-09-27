import { db } from "../lib/db";
import { pledges } from "../lib/db/schema";

async function main() {
    await db.delete(pledges);
    console.log("All pledges deleted successfully.");
    process.exit(0);
}
main().catch(console.error);
