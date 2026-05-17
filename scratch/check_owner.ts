import { db } from "@/lib/db";
import { funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fList = await db.query.funds.findMany({
        where: eq(funds.title, "3D Fon V2")
    });
    
    if (fList.length === 0) {
        console.log("3D Fon V2 not found");
        return;
    }
    console.log("3D Fon V2 ownerId:", fList[0].ownerId);
}

main().catch(console.error);
