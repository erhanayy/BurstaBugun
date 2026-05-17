import { db } from "@/lib/db";
import { fundInvitations, funds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const fList = await db.query.funds.findMany({
        where: eq(funds.title, "3D Fon V2")
    });
    
    if (fList.length === 0) {
        console.log("3D Fon V2 not found");
        return;
    }
    const fId = fList[0].id;

    const invites = await db.query.fundInvitations.findMany({
        where: eq(fundInvitations.fundId, fId)
    });

    console.log("Invites for 3D Fon V2:");
    for (const inv of invites) {
        console.log(`- ID: ${inv.id}, InviteeName: ${inv.inviteeName}, Email: ${inv.inviteeEmail}, InviteeId: ${inv.inviteeId}, Status: ${inv.status}`);
    }
}

main().catch(console.error);
