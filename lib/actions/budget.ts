"use server";

import { db } from "@/lib/db";
import {
    budgetOpeningBalances,
    budgetTransactions,
    tenantBankAccounts,
    parametersTenantSeasons,
    payments,
    studentPaymentLogs,
    funds,
    pledges,
    pledgeTransactions,
    users
} from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface BudgetOpeningBalanceInput {
    id?: string;
    periodId: string;
    bankAccountId?: string | null;
    accountName: string;
    bankName?: string | null;
    iban?: string | null;
    amount: number;
    balanceDate?: string | Date;
    notes?: string | null;
}

export interface BudgetTransactionInput {
    id?: string;
    periodId: string;
    type: 'income' | 'expense';
    category: string;
    title: string;
    counterparty?: string | null;
    amount: number;
    bankAccountId?: string | null;
    transactionDate: string | Date;
    documentNo?: string | null;
    notes?: string | null;
}

export async function getBudgetDashboardData(periodId?: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz erişim" };
        }

        const tenantId = tenantData.tenantId;

        // 1. Fetch all seasons for the tenant
        const allSeasons = await db.query.parametersTenantSeasons.findMany({
            where: eq(parametersTenantSeasons.tenantId, tenantId),
            orderBy: [desc(parametersTenantSeasons.createdAt)]
        });

        if (allSeasons.length === 0) {
            return {
                success: true,
                hasSeasons: false,
                message: "Tanımlı bir dönem bulunamadı. Lütfen önce Parametreler sayfasından bir dönem tanımlayınız.",
                seasons: [],
                activeSeason: null,
            };
        }

        // 2. Resolve target season
        let activeSeason = allSeasons.find(s => s.id === periodId);
        if (!activeSeason) {
            activeSeason = allSeasons.find(s => s.isDefault) || allSeasons[0];
        }

        const currentPeriodId = activeSeason.id;
        const currentPeriodName = activeSeason.period;

        // 3. Bank Accounts
        const bankAccounts = await db.query.tenantBankAccounts.findMany({
            where: and(
                eq(tenantBankAccounts.tenantId, tenantId),
                eq(tenantBankAccounts.isActive, true)
            ),
            orderBy: [asc(tenantBankAccounts.displayOrder), asc(tenantBankAccounts.accountName)]
        });

        // 4. Opening Balances
        const openingBalancesList = await db.query.budgetOpeningBalances.findMany({
            where: and(
                eq(budgetOpeningBalances.tenantId, tenantId),
                eq(budgetOpeningBalances.periodId, currentPeriodId)
            ),
            with: {
                bankAccount: true,
                creator: {
                    columns: { id: true, fullName: true, email: true }
                }
            },
            orderBy: [asc(budgetOpeningBalances.createdAt)]
        });

        const totalOpeningBalance = openingBalancesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 5. Bursary Revenues (Payments from donors for funds in this season)
        // Funds can have funds.period = currentPeriodName or currentPeriodId
        const bursaryPayments = await db.select({
            id: payments.id,
            amount: payments.amount,
            paymentMethod: payments.paymentMethod,
            paymentDate: payments.paymentDate,
            createdAt: payments.createdAt,
            fundTitle: funds.title,
        })
        .from(payments)
        .innerJoin(funds, eq(funds.id, payments.fundId))
        .where(
            and(
                eq(payments.tenantId, tenantId),
                eq(payments.status, 'completed'),
                or(
                    eq(funds.period, currentPeriodName),
                    eq(funds.period, currentPeriodId)
                )
            )
        );

        let bursaryCreditCardTotal = 0;
        let bursaryWireTransferTotal = 0;
        const monthlyBursaryIncome: Record<string, number> = {};

        for (const p of bursaryPayments) {
            const amt = p.amount || 0;
            if (p.paymentMethod === 'subscription' || p.paymentMethod === 'credit_card') {
                bursaryCreditCardTotal += amt;
            } else {
                bursaryWireTransferTotal += amt;
            }

            const d = p.paymentDate || p.createdAt;
            if (d) {
                const monthKey = new Date(d).toISOString().substring(0, 7); // 'YYYY-MM'
                monthlyBursaryIncome[monthKey] = (monthlyBursaryIncome[monthKey] || 0) + amt;
            }
        }
        const totalBursaryIncome = bursaryCreditCardTotal + bursaryWireTransferTotal;

        // 6. Extra Incomes & Operational Expenses (budgetTransactions)
        const allTransactions = await db.query.budgetTransactions.findMany({
            where: and(
                eq(budgetTransactions.tenantId, tenantId),
                eq(budgetTransactions.periodId, currentPeriodId)
            ),
            with: {
                bankAccount: true,
                creator: {
                    columns: { id: true, fullName: true, email: true }
                }
            },
            orderBy: [desc(budgetTransactions.transactionDate), desc(budgetTransactions.createdAt)]
        });

        let totalExtraIncome = 0;
        let totalOperationalExpense = 0;
        const extraIncomeByCategory: Record<string, number> = {};
        const operationalExpenseByCategory: Record<string, number> = {};
        const monthlyExtraIncome: Record<string, number> = {};
        const monthlyOperationalExpense: Record<string, number> = {};

        for (const t of allTransactions) {
            const amt = t.amount || 0;
            const monthKey = new Date(t.transactionDate).toISOString().substring(0, 7);

            if (t.type === 'income') {
                totalExtraIncome += amt;
                extraIncomeByCategory[t.category] = (extraIncomeByCategory[t.category] || 0) + amt;
                monthlyExtraIncome[monthKey] = (monthlyExtraIncome[monthKey] || 0) + amt;
            } else {
                totalOperationalExpense += amt;
                operationalExpenseByCategory[t.category] = (operationalExpenseByCategory[t.category] || 0) + amt;
                monthlyOperationalExpense[monthKey] = (monthlyOperationalExpense[monthKey] || 0) + amt;
            }
        }

        // 7. Scholarship Disbursements (studentPaymentLogs)
        const scholarshipPayments = await db.select({
            id: studentPaymentLogs.id,
            amount: studentPaymentLogs.amount,
            paymentDate: studentPaymentLogs.paymentDate,
            createdAt: studentPaymentLogs.createdAt,
            fundTitle: funds.title,
        })
        .from(studentPaymentLogs)
        .innerJoin(funds, eq(funds.id, studentPaymentLogs.fundId))
        .where(
            and(
                eq(studentPaymentLogs.tenantId, tenantId),
                or(
                    eq(funds.period, currentPeriodName),
                    eq(funds.period, currentPeriodId)
                )
            )
        );

        let totalScholarshipExpense = 0;
        const monthlyScholarshipExpense: Record<string, number> = {};

        for (const sp of scholarshipPayments) {
            const amt = sp.amount || 0;
            totalScholarshipExpense += amt;
            const d = sp.paymentDate || sp.createdAt;
            if (d) {
                const monthKey = new Date(d).toISOString().substring(0, 7);
                monthlyScholarshipExpense[monthKey] = (monthlyScholarshipExpense[monthKey] || 0) + amt;
            }
        }

        // 8. Pledges (Taahhütler)
        const defaultAmount = activeSeason.defaultFundAmount || 5000;
        const defaultDuration = activeSeason.defaultFundDuration || 10;
        const costPerStudent = defaultAmount * defaultDuration;

        const rawPledges = await db.select({
            id: pledges.id,
            targetStudentCount: pledges.targetStudentCount,
            status: pledges.status,
            actualAmount: sql<number>`COALESCE(SUM(${pledgeTransactions.allocatedAmount}), 0)::int`,
        })
        .from(pledges)
        .leftJoin(pledgeTransactions, eq(pledgeTransactions.pledgeId, pledges.id))
        .where(
            and(
                eq(pledges.tenantId, tenantId),
                eq(pledges.periodId, currentPeriodId)
            )
        )
        .groupBy(pledges.id);

        let totalPledgeTarget = 0;
        let totalPledgeActual = 0;
        for (const pl of rawPledges) {
            totalPledgeTarget += (pl.targetStudentCount || 0) * costPerStudent;
            totalPledgeActual += (pl.actualAmount || 0);
        }
        const pledgeRealizationRate = totalPledgeTarget > 0 ? Math.min(100, Math.round((totalPledgeActual / totalPledgeTarget) * 100)) : 0;

        // 9. Consolidated Totals
        const totalIncome = totalBursaryIncome + totalExtraIncome;
        const totalExpense = totalScholarshipExpense + totalOperationalExpense;
        const netCashBalance = totalOpeningBalance + totalIncome - totalExpense;

        // 10. Generate Monthly Cash Flow Table
        // Determine 12-month range for academic season (Sept of Y1 to Aug of Y2 if "2026-2027")
        const allMonthsSet = new Set<string>();

        const seasonMatch = currentPeriodName.match(/(\d{4})[^\d]+(\d{4})/);
        if (seasonMatch) {
            const y1 = parseInt(seasonMatch[1]);
            const y2 = parseInt(seasonMatch[2]);
            // September to December y1
            for (let m = 9; m <= 12; m++) {
                allMonthsSet.add(`${y1}-${String(m).padStart(2, '0')}`);
            }
            // January to August y2
            for (let m = 1; m <= 8; m++) {
                allMonthsSet.add(`${y2}-${String(m).padStart(2, '0')}`);
            }
        }

        // Add any additional months where payments or transactions occurred
        Object.keys(monthlyBursaryIncome).forEach(m => allMonthsSet.add(m));
        Object.keys(monthlyExtraIncome).forEach(m => allMonthsSet.add(m));
        Object.keys(monthlyScholarshipExpense).forEach(m => allMonthsSet.add(m));
        Object.keys(monthlyOperationalExpense).forEach(m => allMonthsSet.add(m));

        const sortedMonths = Array.from(allMonthsSet).sort();

        // Calculate running cash balance month by month
        let runningBalance = totalOpeningBalance;
        const monthlyCashFlow = sortedMonths.map((monthKey) => {
            const bursary = monthlyBursaryIncome[monthKey] || 0;
            const extra = monthlyExtraIncome[monthKey] || 0;
            const mIncome = bursary + extra;

            const scholarship = monthlyScholarshipExpense[monthKey] || 0;
            const operational = monthlyOperationalExpense[monthKey] || 0;
            const mExpense = scholarship + operational;

            const netChange = mIncome - mExpense;
            const startingMonthBalance = runningBalance;
            runningBalance += netChange;

            const [year, month] = monthKey.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthLabel = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

            return {
                monthKey,
                monthLabel,
                startingBalance: startingMonthBalance,
                bursaryIncome: bursary,
                extraIncome: extra,
                totalIncome: mIncome,
                scholarshipExpense: scholarship,
                operationalExpense: operational,
                totalExpense: mExpense,
                netChange,
                closingBalance: runningBalance,
            };
        });

        return {
            success: true,
            hasSeasons: true,
            seasons: allSeasons.map(s => ({
                id: s.id,
                period: s.period,
                isDefault: s.isDefault,
                isActive: s.isActive
            })),
            activeSeason: {
                id: activeSeason.id,
                period: activeSeason.period,
                defaultFundAmount: activeSeason.defaultFundAmount,
                defaultFundDuration: activeSeason.defaultFundDuration,
                startDate: activeSeason.seasonStartDate,
                endDate: activeSeason.seasonEndDate,
            },
            bankAccounts,
            openingBalances: openingBalancesList,
            transactions: allTransactions,
            kpis: {
                totalOpeningBalance,
                totalBursaryIncome,
                bursaryCreditCardTotal,
                bursaryWireTransferTotal,
                totalExtraIncome,
                totalIncome,
                totalScholarshipExpense,
                totalOperationalExpense,
                totalExpense,
                netCashBalance,
                totalPledgeTarget,
                totalPledgeActual,
                pledgeRealizationRate,
                incomeBreakdown: extraIncomeByCategory,
                expenseBreakdown: operationalExpenseByCategory,
            },
            monthlyCashFlow,
        };
    } catch (error: any) {
        console.error("getBudgetDashboardData error:", error);
        return { success: false, error: error.message || "Bütçe verileri alınamadı." };
    }
}

export async function saveBudgetOpeningBalance(data: BudgetOpeningBalanceInput) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        if (!data.accountName?.trim()) {
            return { success: false, error: "Hesap adı zorunludur." };
        }

        if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount < 0) {
            return { success: false, error: "Geçerli bir devir tutarı giriniz." };
        }

        const balanceDate = data.balanceDate ? new Date(data.balanceDate) : new Date();

        if (data.id) {
            await db.update(budgetOpeningBalances)
                .set({
                    bankAccountId: data.bankAccountId || null,
                    accountName: data.accountName.trim(),
                    bankName: data.bankName?.trim() || null,
                    iban: data.iban?.trim() || null,
                    amount: Math.round(data.amount),
                    balanceDate,
                    notes: data.notes?.trim() || null,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(budgetOpeningBalances.id, data.id),
                        eq(budgetOpeningBalances.tenantId, tenantData.tenantId)
                    )
                );
        } else {
            await db.insert(budgetOpeningBalances).values({
                tenantId: tenantData.tenantId,
                periodId: data.periodId,
                bankAccountId: data.bankAccountId || null,
                accountName: data.accountName.trim(),
                bankName: data.bankName?.trim() || null,
                iban: data.iban?.trim() || null,
                amount: Math.round(data.amount),
                balanceDate,
                notes: data.notes?.trim() || null,
                createdBy: tenantData.userId
            });
        }

        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("saveBudgetOpeningBalance error:", error);
        return { success: false, error: error.message || "Açılış bakiyesi kaydedilemedi." };
    }
}

export async function deleteBudgetOpeningBalance(id: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        await db.delete(budgetOpeningBalances)
            .where(
                and(
                    eq(budgetOpeningBalances.id, id),
                    eq(budgetOpeningBalances.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("deleteBudgetOpeningBalance error:", error);
        return { success: false, error: error.message || "Açılış bakiyesi silinemedi." };
    }
}

export async function saveBudgetTransaction(data: BudgetTransactionInput) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        if (!data.title?.trim() || !data.category?.trim() || !data.type) {
            return { success: false, error: "Başlık, kategori ve işlem türü zorunludur." };
        }

        if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount <= 0) {
            return { success: false, error: "Geçerli bir pozitif tutar giriniz." };
        }

        const transactionDate = data.transactionDate ? new Date(data.transactionDate) : new Date();

        if (data.id) {
            await db.update(budgetTransactions)
                .set({
                    type: data.type,
                    category: data.category.trim(),
                    title: data.title.trim(),
                    counterparty: data.counterparty?.trim() || null,
                    amount: Math.round(data.amount),
                    bankAccountId: data.bankAccountId || null,
                    transactionDate,
                    documentNo: data.documentNo?.trim() || null,
                    notes: data.notes?.trim() || null,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(budgetTransactions.id, data.id),
                        eq(budgetTransactions.tenantId, tenantData.tenantId)
                    )
                );
        } else {
            await db.insert(budgetTransactions).values({
                tenantId: tenantData.tenantId,
                periodId: data.periodId,
                type: data.type,
                category: data.category.trim(),
                title: data.title.trim(),
                counterparty: data.counterparty?.trim() || null,
                amount: Math.round(data.amount),
                bankAccountId: data.bankAccountId || null,
                transactionDate,
                documentNo: data.documentNo?.trim() || null,
                notes: data.notes?.trim() || null,
                createdBy: tenantData.userId
            });
        }

        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("saveBudgetTransaction error:", error);
        return { success: false, error: error.message || "İşlem kaydedilemedi." };
    }
}

export async function deleteBudgetTransaction(id: string) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData || (tenantData.userRole !== 'admin' && !tenantData.isSuperAdmin)) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        await db.delete(budgetTransactions)
            .where(
                and(
                    eq(budgetTransactions.id, id),
                    eq(budgetTransactions.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/admin/budget");
        return { success: true };
    } catch (error: any) {
        console.error("deleteBudgetTransaction error:", error);
        return { success: false, error: error.message || "İşlem silinemedi." };
    }
}
