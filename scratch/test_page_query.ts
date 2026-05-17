import { db } from "@/lib/db";
import { fundInvitations, users } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";

async function main() {
    const hakans = await db.query.users.findMany({
        where: eq(users.fullName, "Hakan Ayyıldız")
    });

    for (const hakan of hakans) {
        console.log(`Checking Hakan: ${hakan.email} (${hakan.id})`);
        
        const invitations = await db.query.fundInvitations.findMany({
            where: and(
                or(
                    eq(fundInvitations.inviteeId, hakan.id),
                    eq(fundInvitations.inviteeEmail, hakan.email || "")
                ),
                eq(fundInvitations.status, 'pending')
            ),
            with: {
                fund: true
            }
        });
        
        console.log(`Found ${invitations.length} pending invitations.`);
        for (const inv of invitations) {
            console.log(`- Fund: ${inv.fund?.title}, ID: ${inv.id}`);
        }
        console.log("---");
    }
}

main().catch(console.error);
