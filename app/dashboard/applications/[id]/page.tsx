import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applications, applicationForms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import ViewClient from "./view-client";

export default async function ApplicationViewPage({ params }: { params: { id: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await params;

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, resolvedParams.id),
        with: {
            form: true
        }
    });

    if (!application) {
        return redirect("/dashboard/applications");
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <ViewClient application={application} />
        </div>
    );
}
