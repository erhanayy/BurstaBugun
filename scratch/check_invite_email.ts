import { db } from "@/lib/db";
import { fundInvitations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const invites = await db.query.fundInvitations.findMany({
        where: eq(fundInvitations.id, "b784f75e-4428-40b5-ba17-760590b3ddb2")
    });
    for (const inv of invites) {
        console.log(`Invitee Email: '${inv.inviteeEmail}'`);
    }
}

main().catch(console.error);
