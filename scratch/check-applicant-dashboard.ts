import { getApplicantDashboardData } from "../lib/actions/dashboard";
import { getCurrentTenant } from "../lib/data/tenant";
// Note: We can't easily mock auth(), but we can look at the code of getApplicantDashboardData.
