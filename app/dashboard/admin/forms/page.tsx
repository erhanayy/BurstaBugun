import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import FormsAdminClient from "./forms-client";
import { getForms } from "@/lib/actions/forms";

export default async function AdminFormsPage() {
    const tenant = await getCurrentTenant();
    if (!tenant) return redirect("/login");

    const formsRes = await getForms(tenant.tenantId);
    const forms = formsRes.success ? formsRes.data : [];

    return (
        <FormsAdminClient tenantId={tenant.tenantId} initialForms={forms || []} />
    );
}
