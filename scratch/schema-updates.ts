export const pledgeStatusEnum = pgEnum('pledge_status', ['pending', 'fulfilled']);

export const pledges = pgTable('pledges', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    periodId: uuid('period_id').references(() => parametersTenantSeasons.id).notNull(),
    fullName: text('full_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    targetStudentCount: integer('target_student_count').notNull().default(0),
    status: pledgeStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pledgeTransactions = pgTable('pledge_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    pledgeId: uuid('pledge_id').references(() => pledges.id).notNull(),
    paymentId: uuid('payment_id').references(() => payments.id), // Could be a manual payment or automated
    fundId: uuid('fund_id').references(() => funds.id), // Or just directly attached to a fund
    allocatedStudentCount: integer('allocated_student_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
