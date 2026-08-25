import { getPendingWireTransfers } from "@/lib/actions/wire-transfers";
import { getCurrentTenant } from "@/lib/data/tenant";
import { WireTransferList } from "./wire-transfer-list";

export const dynamic = 'force-dynamic';

export default async function WireTransfersPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const res = await getPendingWireTransfers(tenantData.tenantId);
    const payments = res.success && res.data ? res.data : [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Havale/EFT Onayları</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Sisteme yüklenen ve henüz onaylanmamış havale/EFT dekontlarını buradan inceleyip onaylayabilirsiniz.
                    </p>
                </div>
            </div>

            <WireTransferList payments={payments} />
        </div>
    );
}
