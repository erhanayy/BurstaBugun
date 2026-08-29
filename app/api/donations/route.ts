import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantApiTokens, donations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Token doğrulama
        const validTokenRecord = await db.query.tenantApiTokens.findFirst({
            where: and(eq(tenantApiTokens.token, token), eq(tenantApiTokens.isActive, true)),
            with: {
                tenant: true
            }
        });

        if (!validTokenRecord) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or inactive token' }, { status: 401 });
        }

        const body = await req.json();

        const {
            amount,
            donorName,
            donorTc,
            donorEmail,
            donorPhone,
            isAnonymous,
            isFbiadMember,
            wantsMembershipInfo,
            bankTransactionId,
            bankCode,
            status,
            agreementsAccepted,
            paymentMethod,
            receiptUrl
        } = body;

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        // Bağışı kaydet
        const [newDonation] = await db.insert(donations).values({
            tenantId: validTokenRecord.tenantId,
            amount: parseInt(amount, 10),
            donorName,
            donorTc,
            donorEmail,
            donorPhone,
            isAnonymous: !!isAnonymous,
            isFbiadMember: !!isFbiadMember,
            wantsMembershipInfo: !!wantsMembershipInfo,
            bankTransactionId,
            bankCode,
            agreementsAccepted: !!agreementsAccepted,
            paymentMethod: paymentMethod || 'credit_card',
            receiptUrl: receiptUrl || null,
            status: status === 'pending' ? 'pending' : (status === 'failed' ? 'failed' : 'completed')
        }).returning();

        return NextResponse.json({ 
            success: true, 
            message: 'Donation recorded successfully',
            donationId: newDonation.id 
        });

    } catch (error: any) {
        console.error('Error processing donation:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
