import { db } from "../lib/db";
import { applications, users, parametersTenantSeasons } from "../lib/db/schema";
import { eq, and, or, sql, desc, not } from "drizzle-orm";
import { getAdminApplicants, getAdminApplicantCounts } from "../lib/actions/admin";

async function run() {
    try {
        const periodRes = await db.query.parametersTenantSeasons.findFirst({
            where: eq(parametersTenantSeasons.period, '2026-2027')
        });
        const periodId = periodRes?.id;
        if (!periodId) {
            console.log("Period not found");
            return;
        }

        // 1. How Bursiyer Takip (Admin Applicants) counts:
        const counts = await getAdminApplicantCounts(periodId, 'active', '');
        console.log(`Bursiyer Takip -> in_pool: ${counts.in_pool}, selected: ${counts.selected}, draft: ${counts.draft}, waiting_reference: ${counts.waiting_reference}`);
        
        // Wait, does 'active' status exist in the tabs?
        // tabs = draft, waiting_reference, in_pool, selected. Where are the 'active' (Aktif Bursiyer) students? 
        // Oh, maybe 'active' status is filtered via the 'Aktif Seçimi' dropdown which changes `activeStatus` to 'active' or 'inactive'.
        // Wait, the status of application can be 'active' (meaning actively receiving bursary).
        // Let's get all admin applicants for currentStatus='selected' and 'active'
        const adminSelectedApps = await getAdminApplicants('selected', periodId, 'active');
        const adminActiveApps = await getAdminApplicants('active', periodId, 'active');
        
        const adminList = [...adminSelectedApps, ...adminActiveApps].map(a => a.user?.fullName);
        console.log(`Admin List Total: ${adminList.length}`);

        // 2. How IBAN List counts:
        const ibanApps = await db.query.applications.findMany({
            where: and(
                eq(applications.period, periodId),
                or(
                    eq(applications.status, 'selected'),
                    eq(applications.status, 'active')
                )
            ),
            with: {
                user: true,
                fund: true
            }
        });

        const ibanList = ibanApps.map(app => ({
            applicationId: app.id,
            userId: app.user?.id,
            fullName: app.user?.fullName || "Bilinmeyen",
            isActive: app.user?.isActive,
        })).filter(s => {
            const userIsActive = ibanApps.find(a => a.id === s.applicationId)?.user?.isActive;
            if (userIsActive === false) return false;
            return true;
        });

        console.log(`IBAN List Total: ${ibanList.length}`);

        // Find the difference
        const adminSet = new Set(adminList);
        const ibanSet = new Set(ibanList.map(i => i.fullName));
        
        console.log("\n--- In Admin List but NOT in IBAN List ---");
        for (const name of adminList) {
            if (!ibanSet.has(name)) {
                console.log(name);
            }
        }
        
        console.log("\n--- In IBAN List but NOT in Admin List ---");
        for (const name of ibanList.map(i => i.fullName)) {
            if (!adminSet.has(name)) {
                console.log(name);
            }
        }

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
