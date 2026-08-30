import { db } from "./lib/db";
import { payments } from "./lib/db/schema";
import { eq, asc, and } from "drizzle-orm";

async function run() {
    const fundPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.fundId, '7aec695c-472d-4eb5-956e-f0751fd75b95'),
            eq(payments.status, 'pending')
        ),
        orderBy: [asc(payments.paymentDate)]
    });

    const isArdaErel = true;
    const groupedPlanMap = new Map<string, any>();

    fundPayments.forEach(p => {
        let groupKey = p.id;

        if (!isArdaErel && p.paymentDate) {
            groupKey = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!groupedPlanMap.has(groupKey)) {
            groupedPlanMap.set(groupKey, {
                id: p.id,
                amount: p.amount || 0,
                date: p.paymentDate?.toISOString() || new Date().toISOString(),
                status: p.status || 'pending'
            });
        } else {
            const existing = groupedPlanMap.get(groupKey)!;
            existing.amount += (p.amount || 0);
            existing.id += `,${p.id}`; // Combine IDs with comma
        }
    });

    const plan = Array.from(groupedPlanMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const toplamTutar = plan.reduce((acc, p) => acc + p.amount, 0);
    const tekilTutar = plan.length > 0 ? plan[0].amount : 0;
    
    console.log({ length: plan.length, tekilTutar, toplamTutar, firstAmount: plan[0]?.amount, firstKey: plan[0]?.date });
}
run();
