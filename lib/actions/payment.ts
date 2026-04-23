"use server";

import { db } from "@/lib/db";
import { fundContributors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function processPayment(fundId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Oturum bulunamadı");

    const ext = await db.query.fundContributors.findFirst({
        where: and(
            eq(fundContributors.fundId, fundId),
            eq(fundContributors.userId, tenantData.userId)
        )
    });

    if (ext) {
        await db.update(fundContributors)
            .set({ isPaid: true })
            .where(eq(fundContributors.id, ext.id));
    } else {
        // If they are an owner paying, we can just insert them here 
        await db.insert(fundContributors).values({
            fundId: fundId,
            userId: tenantData.userId,
            amount: 0,
            isPaid: true
        });
    }

    revalidatePath("/dashboard/funds");
    redirect(`/dashboard/funds/${fundId}/payment`);
}
