import { db } from "@/lib/db";
import { fundInvitations, funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const f3dList = await db.query.funds.findMany({
        where: eq(funds.title, "3D Fonu")
    });
    
    if (f3dList.length === 0) {
        console.log("3D fonu not found");
        return;
    }
    const f3dId = f3dList[0].id;

    const invites = await db.query.fundInvitations.findMany({
        where: eq(fundInvitations.fundId, f3dId)
    });

    console.log("Invites for 3D Fonu:");
    for (const inv of invites) {
        console.log(`- ID: ${inv.id}, InviteeName: ${inv.inviteeName}, Email: ${inv.inviteeEmail}, Status: ${inv.status}`);
        if (inv.status === 'accepted') {
            await db.update(fundInvitations).set({ status: 'pending' }).where(eq(fundInvitations.id, inv.id));
            console.log("  -> Changed to pending!");
        }
    }
}

main().catch(console.error);
