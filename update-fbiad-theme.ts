import { db } from "./lib/db";
import { tenants } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fbiadId = "cfc00202-11c1-48dd-ae63-35fd44c60977";
    
    // Logo renginden (Lacivert) alınan tahmini Hex kodu
    const primaryColor = "#0B2A5E"; 

    await db.update(tenants)
        .set({
            logoUrl: "/fbiad-logo.png",
            primaryColor: primaryColor
        })
        .where(eq(tenants.id, fbiadId));

    console.log(`FBİAD tenant updated! Logo: /fbiad-logo.png, Color: ${primaryColor}`);
    process.exit(0);
}
main();
