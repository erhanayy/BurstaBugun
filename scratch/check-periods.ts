import { db } from "../lib/db";
import { parameters } from "../lib/db/schema";
import { like } from "drizzle-orm";

async function main() {
    const p = await db.query.parameters.findMany({
        where: like(parameters.code, 'SEASON_%')
    });
    console.log(p);
    process.exit(0);
}
main();
