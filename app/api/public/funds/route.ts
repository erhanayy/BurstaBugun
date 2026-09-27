import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantApiTokens, parametersTenantSeasons, funds, fundSelections, applications, fundContributors, users } from '@/lib/db/schema';
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

        const tenantId = validTokenRecord.tenantId;

        // Get active season
        const activeSeason = await db.query.parametersTenantSeasons.findFirst({
            where: and(
                eq(parametersTenantSeasons.tenantId, tenantId),
                eq(parametersTenantSeasons.isActive, true)
            )
        });

        if (!activeSeason) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Fetch published funds for this tenant and season
        const activeFunds = await db.query.funds.findMany({
            where: and(
                eq(funds.tenantId, tenantId),
                eq(funds.period, activeSeason.id),
                eq(funds.isActive, true),
                eq(funds.publishOnWebsite, true)
            ),
            with: {
                owner: true,
                contributors: {
                    with: {
                        user: true
                    },
                    where: eq(fundContributors.isActive, true)
                },
                selections: {
                    where: eq(fundSelections.isActive, true),
                    with: {
                        application: true
                    }
                }
            }
        });

        // Map and calculate student count
        const result = activeFunds.map(fund => {
            // Count active students
            const activeStudents = fund.selections.filter(s => s.application && s.application.isActive === true).length;
            
            // Format response
            const responseItem: any = {
                id: fund.id,
                title: fund.title,
                description: fund.description,
                photoUrl: fund.photoUrl,
                targetStudentCount: fund.targetStudentCount,
                studentCount: activeStudents,
                season: activeSeason.period
            };

            if (fund.showOwnerName) {
                responseItem.ownerName = fund.owner?.fullName || "Bilinmiyor";
                responseItem.contributors = fund.contributors.map(c => c.user?.fullName).filter(Boolean);
                // Ensure owner is unique from contributors list
                responseItem.contributors = Array.from(new Set(responseItem.contributors));
            }

            return responseItem;
        });

        // Sort descending by studentCount
        result.sort((a, b) => b.studentCount - a.studentCount);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Error fetching public funds:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
