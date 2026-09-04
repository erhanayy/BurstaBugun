'use server';

import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { payments, funds, fundContributors, users } from '@/lib/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { getCurrentTenant } from '@/lib/data/tenant';

export type PaymentPlanItem = {
  id: string;
  amount: number;
  date: string;
  status: string;
};

import { headers } from 'next/headers';

export type PaymentSessionPayload = {
  fundId: string;
  userId?: string;
  adSoyad: string;
  tekilTutar: number;
  toplamTutar: number;
  taksitMi: boolean;
  plan: PaymentPlanItem[];
  returnUrl?: string;
};

export async function createPaymentSession(fundId: string) {
  try {
    const session = await auth();
    const tenantData = await getCurrentTenant();
    if (!tenantData) {
        return { success: false, error: 'Oturum bulunamadı' };
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, tenantData.userId)
    });
    
    const adSoyad = dbUser?.fullName || session?.user?.name || 'Bilinmeyen Kullanıcı';

    // Fetch the fund
    const fund = await db.query.funds.findFirst({
      where: eq(funds.id, fundId),
    });

    if (!fund) {
      return { success: false, error: 'Fon bulunamadı' };
    }

    // Determine the user's student count responsibility
    const contributors = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fundId)
    });
    
    const isOwner = fund.ownerId === tenantData.userId;
    const myContribution = contributors.find(c => c.userId === tenantData.userId);
    let myCount = 1;

    if (myContribution) {
        myCount = myContribution.studentCount || 1;
    } else if (isOwner) {
        // Fallback for owner if no contributor record exists
        myCount = fund.targetStudentCount || 1;
    } else {
        return { success: false, error: 'Bu fona katkı yetkiniz bulunmuyor' };
    }

    // Check if there are already pending payments for this user
    let fundPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.fundId, fundId),
        eq(payments.userId, tenantData.userId),
        eq(payments.status, 'pending')
      ),
      orderBy: [asc(payments.paymentDate)]
    });

    // If none exist, we generate the payment plan dynamically!
    if (fundPayments.length === 0) {
        const numMonths = fund.durationMonths || 10;
        const amountPerMonth = (fund.monthlyLimit || 0) * myCount;
        
        const newPayments = [];
        let currentDate = fund.startDate ? new Date(fund.startDate) : new Date();
        
        if (fund.paymentMethod === 'upfront') {
            newPayments.push({
                tenantId: tenantData.tenantId,
                fundId: fundId,
                userId: tenantData.userId,
                amount: amountPerMonth * numMonths,
                status: 'pending' as const,
                paymentDate: new Date(currentDate),
            });
        } else {
            for (let i = 0; i < numMonths; i++) {
                newPayments.push({
                    tenantId: tenantData.tenantId,
                    fundId: fundId,
                    userId: tenantData.userId,
                    amount: amountPerMonth,
                    status: 'pending' as const,
                    paymentDate: new Date(currentDate),
                });
                // Add 1 month for next payment
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        
        const inserted = await db.insert(payments).values(newPayments).returning();
        fundPayments = inserted;
    }

    if (fundPayments.length === 0) {
      return { success: false, error: 'Ödenecek bekleyen taksit bulunamadı' };
    }

    const plan: PaymentPlanItem[] = fundPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        date: p.paymentDate?.toISOString() || new Date().toISOString(),
        status: p.status || 'pending'
    }));

    const toplamTutar = plan.reduce((acc, p) => acc + p.amount, 0);
    const tekilTutar = plan.length > 0 ? plan[0].amount : 0;
    const taksitMi = fund.paymentMethod === 'upfront' ? false : plan.length > 1;

    const isProdEnv = process.env.LIVE_ENV === 'true';
    const appDomain = isProdEnv ? 'https://burs.fbiadvakfi.org' : 'http://localhost:3000';
    
    const headersList = await headers();
    let origin = headersList.get('origin');
    if (!origin || origin === 'null') {
        origin = process.env.NEXT_PUBLIC_APP_URL || appDomain;
    }
    
    if (isProdEnv && origin.includes('localhost')) {
        origin = appDomain;
    }
    
    const returnUrl = `${origin}/dashboard/funds/${fundId}/payment`;

    const payload: PaymentSessionPayload = {
      fundId,
      userId: tenantData.userId,
      adSoyad,
      tekilTutar,
      toplamTutar,
      taksitMi,
      plan,
      returnUrl
    };

    const secretKey = process.env.AUTH_SECRET || 'super_secret_generated_key_for_local_dev';
    const secret = new TextEncoder().encode(secretKey);
    
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);
    
    const isProd = process.env.LIVE_ENV === 'true' || process.env.NODE_ENV === 'production';
    console.log("PAYMENT SESSION DEBUG:", { 
        NODE_ENV: process.env.NODE_ENV, 
        LIVE_ENV: process.env.LIVE_ENV, 
        isProd 
    });
    
    const webAppUrl = isProd ? 'https://www.fbiadvakfi.org' : 'http://localhost:3005';
    const paymentUrl = `${webAppUrl}/app-payment?token=${token}`;
    
    return { success: true, url: paymentUrl };
  } catch (error) {
    console.error('Failed to create payment session:', error);
    return { success: false, error: 'Oturum oluşturulamadı' };
  }
}

