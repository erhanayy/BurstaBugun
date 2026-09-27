import { db } from "../lib/db";
import { applications, users } from "../lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";

async function main() {
    const testSeasonId = '6718c3f4-a2a1-4959-847a-00ce71a954e5';
    const targetSeasonId = '8be06227-d43b-44d2-80aa-fb6adfd26547'; // 2026-2027

    const names = [
        'Aselhan Sarıbaş', 
        'Feleknaz Bilir', 
        'Sudenur Tiryaki', 
        'M.Furkan BOSTANCI'
    ];

    // Find the users
    const matchedUsers = await db.select({ id: users.id, name: users.fullName })
        .from(users)
        .where(inArray(users.fullName, names));

    console.log("Matched Users:", matchedUsers);

    if (matchedUsers.length === 0) {
        console.log("No users found.");
        process.exit(1);
    }

    const userIds = matchedUsers.map(u => u.id);

    // Update their applications in Test Dönemi to 2026-2027
    const updateRes = await db.update(applications)
        .set({ period: targetSeasonId })
        .where(
            and(
                inArray(applications.userId, userIds),
                eq(applications.period, testSeasonId)
            )
        );
    
    console.log("Migration completed for the 4 students.");
    process.exit(0);
}
main();
