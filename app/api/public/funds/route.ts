import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantApiTokens, parametersTenantSeasons, funds, fundSelections, applications, fundContributors, users } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

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

        // Fetch ALL published seasons
        const publishedSeasons = await db.query.parametersTenantSeasons.findMany({
            where: and(
                eq(parametersTenantSeasons.tenantId, tenantId),
                eq(parametersTenantSeasons.publishOnWebsite, true)
            ),
            orderBy: [desc(parametersTenantSeasons.period)]
        });

        if (publishedSeasons.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const seasonIds = publishedSeasons.map(s => s.id);

        // Fetch published funds for this tenant in published seasons
        const activeFunds = await db.query.funds.findMany({
            where: and(
                eq(funds.tenantId, tenantId),
                inArray(funds.period, seasonIds),
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
            
            const matchedSeason = publishedSeasons.find(s => s.id === fund.period);
            const seasonPeriod = matchedSeason ? matchedSeason.period : "Bilinmiyor";

            // Format response
            const responseItem: any = {
                id: fund.id,
                title: fund.title,
                description: fund.description,
                photoUrl: fund.photoUrl,
                targetStudentCount: fund.targetStudentCount,
                studentCount: activeStudents,
                season: seasonPeriod
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
