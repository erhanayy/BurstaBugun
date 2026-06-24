'use server';

import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { payments, funds, fundContributors, fundSelections, users } from '@/lib/db/schema';
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

    // Fetch the fund and pending payments
    const fund = await db.query.funds.findFirst({
      where: eq(funds.id, fundId),
      with: {
        selections: {
            where: eq(fundSelections.isActive, true)
        }
      }
    });

    if (!fund) {
      return { success: false, error: 'Fon bulunamadı' };
    }

    const fundPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.fundId, fundId),
        eq(payments.status, 'pending')
      ),
      orderBy: [asc(payments.paymentDate)]
    });

    if (fundPayments.length === 0) {
      return { success: false, error: 'Ödenecek bekleyen taksit bulunamadı' };
    }

    // Filter to user's share
    const contributors = await db.query.fundContributors.findMany({
        where: eq(fundContributors.fundId, fundId)
    });
    
    const selectionsCount = fund.selections?.length || 0;
    const othersCount = contributors.reduce((acc, c) => acc + (c.studentCount || 1), 0);
    const ownerRemaining = Math.max(0, selectionsCount - othersCount);

    // Check if user is a contributor
    const isContributor = contributors.some(c => c.userId === tenantData.userId);
    const isOwner = fund.ownerId === tenantData.userId;

    // Use fund.selections for STABLE order of students
    const stableSelections = [...(fund.selections || [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Explicitly assigned students ONLY (for everyone, including owner)
    let myAppIds: string[] = stableSelections
        .filter(s => s.sponsorId === tenantData.userId)
        .map(s => s.applicationId);

    const displayedPayments = fundPayments.filter(p => myAppIds.includes(p.applicationId));

    if (displayedPayments.length === 0) {
      return { success: false, error: 'Size atanmış ödenecek bekleyen taksit bulunamadı' };
    }

    const toplamTutar = displayedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const tekilTutar = displayedPayments[0].amount || 0;
    const taksitMi = displayedPayments.length > 1;

    const plan: PaymentPlanItem[] = displayedPayments.map(p => ({
      id: p.id,
      amount: p.amount || 0,
      date: p.paymentDate?.toISOString() || new Date().toISOString(),
      status: p.status || 'pending'
    }));

    const isProdEnv = process.env.LIVE_ENV === 'true';
    const appDomain = isProdEnv ? 'https://burs.fbiadvakfi.org' : 'http://localhost:3000';
    
    const headersList = await headers();
    // Prefer origin if it's there and valid, otherwise fallback to environment domain
    let origin = headersList.get('origin');
    if (!origin || origin === 'null') {
        origin = process.env.NEXT_PUBLIC_APP_URL || appDomain;
    }
    
    // Safety check: if in production, force the production domain if origin is somehow localhost
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
    
    // Create JWT valid for 15 minutes
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);
    
    // The web app URL should be mapped. For production, we use the public URL.
    // If we are on localhost, we can fallback to localhost:3005 for local testing.
    const isProd = process.env.LIVE_ENV === 'true';
    console.log("PAYMENT SESSION DEBUG:", { 
        NODE_ENV: process.env.NODE_ENV, 
        LIVE_ENV: process.env.LIVE_ENV, 
        isProd 
    });
    const webAppUrl = isProd ? 'https://fbiadvakfi.org' : 'http://localhost:3005';
    const paymentUrl = `${webAppUrl}/app-payment?token=${token}`;
    
    return { success: true, url: paymentUrl };
  } catch (error) {
    console.error('Failed to create payment session:', error);
    return { success: false, error: 'Oturum oluşturulamadı' };
  }
}
