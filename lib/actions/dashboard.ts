"use server";

import { db } from "@/lib/db";
import { users, tenantUsers, funds, fundContributors, fundSelections, applications, references, payments, loginLogs, fundInvitations } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, sql, desc, isNotNull, or, gte, inArray } from "drizzle-orm";

export async function getDashboardPeriods() {
    const items = await db.selectDistinct({ period: funds.period })
        .from(funds)
        .where(isNotNull(funds.period));
    return items.map(i => i.period).filter(Boolean) as string[];
}

export async function getAdminDashboardData(period: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const userObj = await db.query.users.findFirst({ where: eq(users.id, tenantData.userId) });
    if (!userObj?.isApplicationAdmin) return null;

    const baseFundCondition = period
        ? and(eq(funds.tenantId, tenantData.tenantId), eq(funds.period, period))
        : eq(funds.tenantId, tenantData.tenantId);

    const activeFunds = await db.select({ count: sql<number>`count(*)` })
        .from(funds)
        .where(and(baseFundCondition, eq(funds.isActive, true)));

    const allUsers = await db.select({ count: sql<number>`count(*)` })
        .from(users);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLoginQuery = await db.select({ count: sql<number>`count(distinct ${loginLogs.userId})` })
        .from(loginLogs)
        .where(gte(loginLogs.loggedInAt, thirtyDaysAgo));

    return {
        totalUsers: Number(allUsers[0]?.count || 0),
        activeFunds: Number(activeFunds[0]?.count || 0),
        recentActiveUsers: Number(recentLoginQuery[0]?.count || 0),
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

    return {
        status: myApp.status,
        fundTitle: myApp.fund?.title,
        totalReceived,
        totalPending,
        nextPaymentDate,
        approvedRefs,
        totalRefs,
    };
}


