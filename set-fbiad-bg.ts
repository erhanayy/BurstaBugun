import { db } from "./lib/db";
import { tenants } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fbiadId = "cfc00202-11c1-48dd-ae63-35fd44c60977";
    
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, fbiadId));
    
    if (!tenant) {
        console.error("FBİAD tenant not found!");
        process.exit(1);
    }
    
    const features = tenant.features as any || {};
    features.backgroundColor = "rgb(209, 174, 102)"; // The requested gold color

    await db.update(tenants)
        .set({ features })
        .where(eq(tenants.id, fbiadId));

    console.log("FBİAD background color set to RGB(209, 174, 102)");
    process.exit(0);
}
main();
