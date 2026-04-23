import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { references, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import ReferenceReviewClient from "./reference-review-client";

export default async function ReferenceReviewPage({ params }: { params: { id: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });

    if (!currentUser || !currentUser.email) return redirect("/login");

    const resolvedParams = await params;

    const reference = await db.query.references.findFirst({
        where: and(
            eq(references.id, resolvedParams.id),
            eq(references.email, currentUser.email)
        ),
        with: {
            application: {
                with: {
                    user: true,
                    form: true
                }
            }
        }
    });

    if (!reference) {
        return redirect("/dashboard/invitations");
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <ReferenceReviewClient reference={reference} />
        </div>
    );
}
