"use server";

import { db } from "@/lib/db";
import { users, tenantUsers, funds, fundContributors, fundSelections, applications, references, payments, loginLogs, fundInvitations, parametersTenantSeasons, pledges, pledgeTransactions, studentPaymentLogs } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, sql, desc, isNotNull, or, gte, inArray } from "drizzle-orm";

export async function getDashboardPeriods() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const items = await db.query.parametersTenantSeasons.findMany({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: (p, { desc }) => [desc(p.isDefault), desc(p.period)]
    });
    
    const isAdmin = tenantData.userRole === 'admin';
    const filteredItems = items.filter(i => isAdmin || !i.adminOnly);
    
    return filteredItems.map(i => i.period).filter(Boolean) as string[];
}

export async function getAdminDashboardData(period: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const userObj = await db.query.users.findFirst({ where: eq(users.id, tenantData.userId) });
    if (!userObj?.isApplicationAdmin) return null;

    let seasonId: string | null = null;
    let seasonObj: typeof parametersTenantSeasons.$inferSelect | null = null;

    if (period) {
        const season = await db.query.parametersTenantSeasons.findFirst({
            where: and(
                eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
                eq(parametersTenantSeasons.period, period)
            )
        });
        if (season) {
            seasonId = season.id;
            seasonObj = season;
        }
    } else {
        const defaultSeason = await db.query.parametersTenantSeasons.findFirst({
            where: and(
                eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
                eq(parametersTenantSeasons.isDefault, true)
            )
        });
        if (defaultSeason) {
            seasonId = defaultSeason.id;
            seasonObj = defaultSeason;
        }
    }

    const defaultAmount = seasonObj?.defaultFundAmount || 5000;
    const defaultDuration = seasonObj?.defaultFundDuration || 10;

    // 1. FONLAR
    const fundCondition = seasonId
        ? and(eq(funds.tenantId, tenantData.tenantId), eq(funds.period, seasonId), eq(funds.isActive, true))
        : and(eq(funds.tenantId, tenantData.tenantId), eq(funds.isActive, true));

    const activeFundsList = await db.query.funds.findMany({
        where: fundCondition
    });

    const activeFunds = activeFundsList.length;
    const commonPoolFundsCount = activeFundsList.filter(f => f.paymentMethod === 'wire_transfer' || f.title.includes('EFT') || f.title.includes('Havale')).length;
    const memberFundsCount = activeFunds - commonPoolFundsCount;

    // 2. BURSVEREN BİLGİLERİ (Pledges & Targets)
    const pledgeCondition = seasonId
        ? and(eq(pledges.tenantId, tenantData.tenantId), eq(pledges.periodId, seasonId))
        : eq(pledges.tenantId, tenantData.tenantId);

    const pledgesList = await db.query.pledges.findMany({
        where: pledgeCondition
    });

    const pledgeSupportersCount = pledgesList.length;
    const pledgedTargetStudentsCount = pledgesList.reduce((acc, p) => acc + (p.targetStudentCount || 0), 0);
    const totalPledgedAmount = pledgedTargetStudentsCount * defaultDuration * defaultAmount;

    // 3. BURSİYER BİLGİLERİ
    const appCondition = seasonId
        ? and(eq(applications.tenantId, tenantData.tenantId), eq(applications.period, seasonId))
        : eq(applications.tenantId, tenantData.tenantId);

    const periodApplications = await db.query.applications.findMany({
        where: appCondition
    });

    const totalApplicationsCount = periodApplications.length;
    const inPoolStudents = periodApplications.filter(a => a.status === 'in_pool').length;

    // Fona Atanan Bursiyerler (Active Fund Selections)
    const activeSelectionsList = await db.query.fundSelections.findMany({
        where: eq(fundSelections.isActive, true),
        with: { fund: true }
    });

    const periodSelections = activeSelectionsList.filter(s => 
        s.fund && 
        s.fund.isActive && 
        (!seasonId || s.fund.period === seasonId)
    );

    const selectedStudentsCount = periodSelections.length;

    let memberFundStudentsCount = 0;
    let commonPoolStudentsCount = 0;

    periodSelections.forEach(s => {
        if (s.fund.paymentMethod === 'wire_transfer' || s.fund.title.includes('EFT') || s.fund.title.includes('Havale')) {
            commonPoolStudentsCount++;
        } else {
            memberFundStudentsCount++;
        }
    });

    // 4. ÖDEMELER BİLGİLERİ
    const pledgeTxnList = await db.query.pledgeTransactions.findMany({
        with: { pledge: true, payment: true }
    });

    const periodTxns = pledgeTxnList.filter(pt => pt.pledge && (!seasonId || pt.pledge.periodId === seasonId));
    
    let totalCollectedAmount = 0;
    let wireTransferCollectedAmount = 0;
    let creditCardCollectedAmount = 0;

    periodTxns.forEach(t => {
        totalCollectedAmount += t.allocatedAmount;
        if (t.payment) {
            if (t.payment.paymentMethod === 'credit_card' || t.payment.paymentMethod === 'subscription') {
                creditCardCollectedAmount += t.allocatedAmount;
            } else {
                wireTransferCollectedAmount += t.allocatedAmount;
            }
        } else {
            wireTransferCollectedAmount += t.allocatedAmount;
        }
    });

    // Öğrencilere Yapılan Ödemeler Toplamı (Student Payment Logs)
    const allStudentLogs = await db.query.studentPaymentLogs.findMany({
        where: eq(studentPaymentLogs.tenantId, tenantData.tenantId),
        with: { fund: true }
    });

    const periodStudentLogs = allStudentLogs.filter(l => 
        l.fund && 
        l.fund.isActive && 
        (!seasonId || l.fund.period === seasonId)
    );

    const totalStudentPayoutsAmount = periodStudentLogs.reduce((acc, l) => acc + (l.amount || 0), 0);

    // General user stats
    const allUsers = await db.select({ count: sql<number>`count(*)` })
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenantData.tenantId));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLoginQuery = await db.select({ count: sql<number>`count(distinct ${loginLogs.userId})` })
        .from(loginLogs)
        .where(
            and(
                gte(loginLogs.loggedInAt, thirtyDaysAgo),
                eq(loginLogs.tenantId, tenantData.tenantId)
            )
        );

    const activeSponsors = await db.select({ count: sql<number>`count(*)` })
        .from(tenantUsers)
        .where(and(eq(tenantUsers.tenantId, tenantData.tenantId), eq(tenantUsers.role, 'sponsor')));

    return {
        totalUsers: Number(allUsers[0]?.count || 0),
        activeFunds,
        memberFundsCount,
        commonPoolFundsCount,
        memberFundStudentsCount,
        commonPoolStudentsCount,
        recentActiveUsers: Number(recentLoginQuery[0]?.count || 0),
        
        // Bursveren
        pledgeSupportersCount,
        pledgedTargetStudentsCount,
        defaultAmount,
        defaultDuration,
        totalPledgedAmount,
        activeSponsors: Number(activeSponsors[0]?.count || 0),

        // Bursiyer
        totalApplicationsCount,
        selectedStudents: selectedStudentsCount,
        inPoolStudents,

        // Ödemeler
        totalCollectedAmount,
        wireTransferCollectedAmount,
        creditCardCollectedAmount,
        totalStudentPayoutsAmount,
    };
}

export async function getSponsorDashboardData(period: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const baseFundCondition = period ? eq(funds.period, period) : undefined;

    const ownedFundsRes = await db.query.funds.findMany({
        where: and(eq(funds.ownerId, tenantData.userId), baseFundCondition), // and ignores undefined
        with: { selections: { where: eq(fundSelections.isActive, true) } }
    });

    const contributedFundsRes = await db.query.fundContributors.findMany({
        where: eq(fundContributors.userId, tenantData.userId),
        with: { fund: { with: { selections: { where: eq(fundSelections.isActive, true) } } } }
    });

    const validContributions = period
        ? contributedFundsRes.filter(c => c.fund && c.fund.period === period)
        : contributedFundsRes;

    const uniqueFundIds = new Set<string>();
    let totalSelectedStudents = 0;

    ownedFundsRes.forEach(f => {
        uniqueFundIds.add(f.id);
        totalSelectedStudents += (f.selections?.length || 0);
    });

    validContributions.forEach(c => {
        if (!uniqueFundIds.has(c.fund.id)) {
            uniqueFundIds.add(c.fund.id);
            totalSelectedStudents += (c.fund.selections?.length || 0);
        }
    });

    const fundIdArray = Array.from(uniqueFundIds);

    let totalPaid = 0;
    let totalPending = 0;

    if (fundIdArray.length > 0) {
        const paymentList = await db.query.payments.findMany({
            where: inArray(payments.fundId, fundIdArray)
        });

        paymentList.forEach(p => {
            if (p.status === 'completed') totalPaid += p.amount;
            else if (p.status === 'pending') totalPending += p.amount;
        });
    }

    if (ownedFundsRes.length === 0 && validContributions.length === 0) return null;

    return {
        ownedFundsCount: ownedFundsRes.length,
        participatedFundsCount: validContributions.length,
        totalSelectedStudents,
        totalPaid,
        totalPending
    };
}

export async function getReferenceDashboardData(period: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const user = await db.query.users.findFirst({ where: eq(users.id, tenantData.userId) });
    if (!user || !user.email) return null;

    const myRefs = await db.query.references.findMany({
        where: and(eq(references.email, user.email), eq(references.status, 'approved')),
        with: {
            application: {
                with: { fund: true }
            }
        }
    });

    let totalStudents = 0;
    let totalPaid = 0;
    let totalPending = 0;

    const validAppIds: string[] = [];

    myRefs.forEach(ref => {
        if (!ref.application || ref.application.status === 'in_pool' || ref.application.status === 'draft') return;
        if (period && ref.application.fund && ref.application.fund.period !== period) return;
        validAppIds.push(ref.applicationId);
        totalStudents++;
    });

    if (validAppIds.length > 0) {
        const paymentList = await db.query.payments.findMany({
            where: inArray(payments.applicationId, validAppIds)
        });
        paymentList.forEach(p => {
            if (p.status === 'completed') totalPaid += p.amount;
            else if (p.status === 'pending') totalPending += p.amount;
        });
    }

    if (totalStudents === 0) return null;

    return {
        totalStudents,
        totalPaid,
        totalPending
    };
}

export async function getApplicantDashboardData(period: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const myApp = await db.query.applications.findFirst({
        where: eq(applications.userId, tenantData.userId),
        orderBy: (applications, { desc }) => [desc(applications.createdAt)],
        with: {
            fund: true,
            references: true
        }
    });

    if (!myApp) return null; // Not an applicant 

    if (period && myApp.fund && myApp.fund.period !== period) return null; // Applies period filter

    let totalReceived = 0;
    let totalPending = 0;
    let nextPaymentDate: Date | null = null;

    const myPms = await db.query.payments.findMany({
        where: eq(payments.applicationId, myApp.id),
        orderBy: (payments, { asc }) => [asc(payments.paymentDate)]
    });

    myPms.forEach(p => {
        if (p.status === 'completed') totalReceived += p.amount;
        else if (p.status === 'pending') {
            totalPending += p.amount;
            if (!nextPaymentDate && p.paymentDate) {
                nextPaymentDate = p.paymentDate;
            }
        }
    });

    let approvedRefs = 0;
    const totalRefs = myApp.references.length;
    myApp.references.forEach(r => {
        if (r.status === 'approved') approvedRefs++;
    });

    let isFundConfirmed = true;
    if (myApp.fundId) {
        const contributors = await db.query.fundContributors.findMany({
            where: eq(fundContributors.fundId, myApp.fundId)
        });
        
        if (contributors.length > 0) {
            isFundConfirmed = contributors.every(c => c.isPaid);
        } else {
            // Eğer fona ait katılımcı (contributor) yoksa, bu tekil sponsorlu bir fondur.
            // Bu nedenle fon varsayılan olarak onaylı kabul edilir.
            isFundConfirmed = true; 
        }
    }

    // Yorumlanan yeni kurala göre: Eğer fon henüz tamamen onaylanmadıysa/ödenmediyse
    // Öğrenciye status'ü 'in_pool' (Havuzda) gibi gösterip fon adını gizleyeceğiz.
    const displayStatus = (myApp.status === 'selected' || myApp.status === 'active') && !isFundConfirmed 
        ? 'in_pool' 
        : myApp.status;

    return {
        status: displayStatus,
        fundTitle: isFundConfirmed ? myApp.fund?.title : undefined,
        totalReceived,
        totalPending,
        nextPaymentDate,
        approvedRefs,
        totalRefs,
        isFundConfirmed // Frontend'in bilmesi gerekirse diye
    };
}


