import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contracts } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const typesParam = url.searchParams.get('types');
        
        let conditions = [eq(contracts.isActive, true)];
        
        if (typesParam) {
            const types = typesParam.split(',');
            conditions.push(inArray(contracts.type, types as any));
        }

        const activeContracts = await db.query.contracts.findMany({
            where: and(...conditions),
            orderBy: (contracts, { desc }) => [desc(contracts.createdAt)],
        });

        // Filter to only return the latest of each type
        const latestContracts: Record<string, any> = {};
        for (const contract of activeContracts) {
            if (!latestContracts[contract.type]) {
                latestContracts[contract.type] = contract;
            }
        }

        return NextResponse.json({ success: true, data: Object.values(latestContracts) });
    } catch (error: any) {
        console.error('Error fetching public contracts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
