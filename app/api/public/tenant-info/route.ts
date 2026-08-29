import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantApiTokens, systemParameters } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Verify token
        const validTokenRecord = await db.query.tenantApiTokens.findFirst({
            where: and(eq(tenantApiTokens.token, token), eq(tenantApiTokens.isActive, true))
        });

        if (!validTokenRecord) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or inactive token' }, { status: 401 });
        }

        // Fetch IBAN details from systemParameters for this tenant
        const params = await db.query.systemParameters.findMany({
            where: and(
                eq(systemParameters.tenantId, validTokenRecord.tenantId),
                eq(systemParameters.key, 'TENANT_IBAN')
            )
        });
        
        const accountParams = await db.query.systemParameters.findMany({
            where: and(
                eq(systemParameters.tenantId, validTokenRecord.tenantId),
                eq(systemParameters.key, 'TENANT_ACCOUNT_NAME')
            )
        });

        const tenantIban = params.length > 0 ? params[0].value : "";
        const tenantAccountName = accountParams.length > 0 ? accountParams[0].value : "";

        return NextResponse.json({
            success: true,
            data: {
                tenantIban,
                tenantAccountName
            }
        });

    } catch (error: any) {
        console.error('Error fetching tenant info:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
