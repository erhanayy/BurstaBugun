import { db } from "../lib/db";
import { chatRoomMembers } from "../lib/db/schema";
import { inArray } from "drizzle-orm";

async function run() {
    try {
        const members = await db.select().from(chatRoomMembers);
        const map = new Map<string, string[]>();
        
        for (const m of members) {
            const key = `${m.roomId}_${m.userId}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(m.id);
        }
        
        let toDelete: string[] = [];
        for (const [key, ids] of map.entries()) {
            if (ids.length > 1) {
                // keep the first one, delete the rest
                toDelete.push(...ids.slice(1));
            }
        }
        
        if (toDelete.length > 0) {
            console.log(`Found ${toDelete.length} duplicate members. Deleting...`);
            await db.delete(chatRoomMembers).where(inArray(chatRoomMembers.id, toDelete));
            console.log("Deleted duplicates.");
        } else {
            console.log("No duplicates found.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
