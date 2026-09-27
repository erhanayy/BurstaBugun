import { getAdminDashboardData } from "../lib/actions/dashboard";
import { getCurrentTenant } from "../lib/data/tenant";

async function run() {
    try {
        const tenantData = await getCurrentTenant();
        console.log("Tenant:", tenantData);
        // We can't really call getCurrentTenant because it relies on cookies/headers.
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
