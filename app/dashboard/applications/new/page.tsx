import { getCurrentTenant } from "@/lib/data/tenant";
import { db } from "@/lib/db";
import { applicationForms, applications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import WizardClient from "./wizard-client";
import { redirect } from "next/navigation";

export default async function NewApplicationPage() {
    const tenant = await getCurrentTenant();
    if (!tenant) return redirect("/login");

    const activeForm = await db.query.applicationForms.findFirst({
        where: eq(applicationForms.tenantId, tenant.tenantId),
        orderBy: [desc(applicationForms.createdAt)],
    });

    if (!activeForm || !activeForm.steps || (activeForm.steps as any[]).length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pt-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Başvuru Formu Bulunamadı</h3>
                    <p className="text-yellow-700 dark:text-yellow-300/80">
                        Şu anda sistemde tanımlı güncel bir başvuru formu bulunmuyor. Lütfen yönetimin formu yayına almasını bekleyiniz.
                    </p>
                </div>
            </div>
        );
    }

    const existingDraft = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenant.userId),
            eq(applications.tenantId, tenant.tenantId),
            eq(applications.formId, activeForm.id),
            eq(applications.status, "draft")
        ),
        orderBy: [desc(applications.createdAt)]
    });

    const lastCompletedApplication = await db.query.applications.findFirst({
        where: and(
            eq(applications.userId, tenant.userId),
            eq(applications.tenantId, tenant.tenantId)
        ),
        orderBy: [desc(applications.createdAt)]
    });

    // Don't pass previous if the last completed is exactly the same as the current draft
    const previousAnswers = (lastCompletedApplication && lastCompletedApplication.id !== existingDraft?.id && lastCompletedApplication.answersJson)
        ? JSON.parse(lastCompletedApplication.answersJson)
        : null;

    return (
        <WizardClient
            form={activeForm}
            tenantId={tenant.tenantId}
            userId={tenant.userId}
            existingAnswers={existingDraft?.answersJson ? JSON.parse(existingDraft.answersJson) : {}}
            existingDraftId={existingDraft?.id || null}
            previousAnswers={previousAnswers}
        />
    );
}
