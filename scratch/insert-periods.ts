import { db } from "../lib/db";
import { parameters } from "../lib/db/schema";
import { v4 as uuidv4 } from "uuid";

async function main() {
    const newPeriods = [
        { code: 'SEASON_TEST', dataStr: 'Test Dönemi' },
        { code: 'SEASON_0', dataStr: '2023-2024' },
        { code: 'SEASON_0_1', dataStr: '2024-2025' }
    ];

    for (const p of newPeriods) {
        await db.insert(parameters).values({
            id: uuidv4(),
            code: p.code,
            dataStr: p.dataStr
        });
    }

    console.log("Periods inserted successfully.");
    process.exit(0);
}
main();
