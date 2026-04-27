"use client";

import { usePathname } from "next/navigation";
import { ForceContractSignature } from "./force-contract-signature";

export function ContractEnforcer({
    userId,
    pendingContracts,
}: {
    userId: string;
    pendingContracts: any[];
}) {
    const pathname = usePathname();

    // If there is nothing to sign, quietly do nothing
    if (!pendingContracts || pendingContracts.length === 0) {
        return null;
    }

    // Exempt the Admin Agreement Management screen so the admin 
    // doesn't immediately get trapped after creating a new contract version
    if (pathname === "/dashboard/admin/agreements") {
        return null;
    }

    // Trapped! Massive unclosable full screen view
    return (
        <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            <ForceContractSignature userId={userId} pendingContracts={pendingContracts} />
        </div>
    );
}
