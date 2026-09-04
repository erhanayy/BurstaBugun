import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applications, references } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import ReferencesClient from "./references-client";

export default async function ApplicationReferencesPage({ params }: { params: { id: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await params;

    const application = await db.query.applications.findFirst({
        where: and(
            eq(applications.id, resolvedParams.id),
            eq(applications.userId, tenantData.userId)
        ),
        with: {
            form: true,
            references: true
        }
    });

    if (!application) {
        return redirect("/dashboard/applications");
    }
    
    const { getSystemParameter } = await import("@/lib/actions/parameters");
    const enableExemptionStr = await getSystemParameter("ENABLE_FORMER_STUDENT_EXEMPTION", "false");
    const exemptionTextStr = await getSystemParameter("EXEMPTION_QUESTION_TEXT", `${tenantData.tenantName} Eski Bursiyeriyim`);

    return (
        <div className="max-w-4xl mx-auto py-8">
            <ReferencesClient 
                application={application} 
                enableExemption={enableExemptionStr === "true"}
                exemptionText={exemptionTextStr}
            />
        </div>
    );
}
