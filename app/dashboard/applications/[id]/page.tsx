import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applications, applicationForms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import ViewClient from "./view-client";
import { getSystemParameter } from "@/lib/actions/parameters";
import { maskFullName } from "@/lib/utils";

export default async function ApplicationViewPage({ params }: { params: { id: string } }) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return redirect("/login");

    const resolvedParams = await params;

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, resolvedParams.id),
        with: {
            form: true,
            user: true
        }
    });

    if (!application) {
        return redirect("/dashboard/applications");
    }

    const maskNamesStr = await getSystemParameter("MASK_STUDENT_NAMES", "false");
    const shouldMask = maskNamesStr === "true" && tenantData.userRole !== 'admin';
    const studentName = shouldMask ? maskFullName(application.user?.fullName) : application.user?.fullName;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <ViewClient application={application} studentName={studentName || ""} />
        </div>
    );
}
