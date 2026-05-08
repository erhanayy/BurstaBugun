import { getPublicTenantInfo } from "@/lib/data/tenant";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
    const tenantInfo = await getPublicTenantInfo();
    
    return (
        <LoginForm 
            tenantName={tenantInfo.tenantName} 
            logoUrl={tenantInfo.logoUrl} 
            primaryColor={tenantInfo.primaryColor}
            backgroundColor={tenantInfo.backgroundColor}
        />
    );
}
