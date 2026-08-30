import { db } from "./lib/db";
import { funds } from "./lib/db/schema";
import { ilike } from "drizzle-orm";
async function run() {
    const fs = await db.query.funds.findMany({
        where: ilike(funds.title, '%TEST 2025-2026 3%'),
        with: { owner: true }
    });
    console.log(fs.map(f => ({id: f.id, title: f.title, owner: f.owner.fullName})));
}
run();
