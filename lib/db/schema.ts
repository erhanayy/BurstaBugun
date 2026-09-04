import { pgTable, text, timestamp, boolean, uuid, integer, unique, pgEnum, index, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Altyapı ve Genel Tablolar ---

// Tenants (Kurum/Platform instance)
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    shortName: text('short_name').notNull(),
    longName: text('long_name').notNull(),
    logoUrl: text('logo_url'),
    websiteUrl: text('website_url'),
    primaryColor: text('primary_color').default('#2563EB'), // Default blue
    canSponsorSelectFromPool: boolean('can_sponsor_select_from_pool').default(false).notNull(),
    features: jsonb('features').default({}), // Feature flags like { hasCustomForm: true }
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users (Kullanıcılar)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id), // Nullable for Super Admins
    phoneNumber: text('phone_number').notNull(),
    fullName: text('full_name').notNull(),
    email: text('email'),
    password: text('password'),
    iban: varchar('iban', { length: 50 }),
    ibanName: varchar('iban_name', { length: 150 }),
    forcePasswordChange: boolean('force_password_change').default(true).notNull(),
    verificationCode: text('verification_code'),
    verificationCodeExpiresAt: timestamp('verification_code_expires_at'),
    isActive: boolean('is_active').default(true).notNull(),
    isApplicationAdmin: boolean('is_application_admin').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    phoneTenantUnq: unique().on(t.phoneNumber, t.tenantId),
}));

export const tenantUserRoleEnum = pgEnum('tenant_user_role', ['admin', 'sponsor', 'contributor', 'reference', 'applicant']);

// Tenant Users (Roller için)
export const tenantUsers = pgTable('tenant_users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    role: tenantUserRoleEnum('role').notNull().default('applicant'),
    status: text('status', { enum: ['active', 'banned'] }).notNull().default('active'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('tenant_users_tenant_idx').on(t.tenantId),
    userIdx: index('tenant_users_user_idx').on(t.userId),
}));

// System Parameters
export const parameters = pgTable('parameters', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),
    dataInt: integer('data_int'),
    dataStr: text('data_str'),
});

// Tenant Seasons (Dönemler - parameters_tenant_seasons)
export const parametersTenantSeasons = pgTable('parameters_tenant_seasons', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    period: text('period').notNull(), // Örn: 2026-2027
    isActive: boolean('is_active').default(true).notNull(),
    appStartDate: timestamp('app_start_date'),
    appEndDate: timestamp('app_end_date'),
    fundStartDate: timestamp('fund_start_date'),
    fundEndDate: timestamp('fund_end_date'),
    sponsorPaymentStartDate: timestamp('sponsor_payment_start_date'),
    sponsorPaymentEndDate: timestamp('sponsor_payment_end_date'),
    studentPaymentStartDate: timestamp('student_payment_start_date'),
    studentPaymentEndDate: timestamp('student_payment_end_date'),
    seasonStartDate: timestamp('season_start_date'),
    seasonEndDate: timestamp('season_end_date'),
    defaultFundAmount: integer('default_fund_amount'),
    defaultFundDuration: integer('default_fund_duration'),
    defaultFundStartDate: timestamp('default_fund_start_date'),
    defaultFundEndDate: timestamp('default_fund_end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantPeriodUnq: unique().on(t.tenantId, t.period),
}));

// Email Log
export const emailLogs = pgTable('email_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    sentTo: text('sent_to').notNull(),
    sender: text('sender').notNull(),
    subject: text('subject'),
    screen: text('screen'),
    status: text('status').notNull().default('logged'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const loginLogs = pgTable('login_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    loggedInAt: timestamp('logged_in_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('login_logs_tenant_idx').on(t.tenantId),
    userTimeIdx: index('login_logs_user_time_idx').on(t.userId, t.loggedInAt),
}));

// --- BurstaBugun Özgü Tablolar ---

// Funds (Burs Fonları)
export const funds = pgTable('funds', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    ownerId: uuid('owner_id').references(() => users.id).notNull(), // Bursveren Sponsor
    title: text('title').notNull(),
    description: text('description'),
    monthlyLimit: integer('monthly_limit'),
    yearlyLimit: integer('yearly_limit'),
    period: text('period'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    durationMonths: integer('duration_months'),
    targetStudentCount: integer('target_student_count'),
    paymentMethod: text('payment_method').default('monthly'), // 'upfront' | 'monthly'
    collectedAmount: integer('collected_amount').default(0).notNull(),
    distributedAmount: integer('distributed_amount').default(0).notNull(),
    photoUrl: text('photo_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fund Contributors (Katılımcılar)
export const fundContributors = pgTable('fund_contributors', {
    id: uuid('id').defaultRandom().primaryKey(),
    fundId: uuid('fund_id').references(() => funds.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    amount: integer('amount').notNull(),
    studentCount: integer('student_count').default(1).notNull(),
    isPaid: boolean('is_paid').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dynamic Application Forms (Dinamik Başvuru Formları)
export const applicationForms = pgTable('application_forms', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    steps: jsonb('steps').default([]).notNull(), // JSON array of form step definitions
    referenceMailTemplate: text('reference_mail_template').default('Değerli {isim}, {ogrenci} isimli öğrenci burs başvurusu için sizi referans göstermiştir. Başvuruyu onaylamak için lütfen sisteme giriş yapınız.'),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationStatusEnum = pgEnum('application_status', ['draft', 'submitted', 'waiting_reference', 'in_pool', 'selected', 'active', 'stopped']);

// Applications (Bursiyer Başvuruları)
export const applications = pgTable('applications', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    fundId: uuid('fund_id').references(() => funds.id), // Optional until selected
    formId: uuid('form_id').references(() => applicationForms.id), // Hangi forma göre dolduruldu // Optional for backward comp
    period: text('period'), // Öğrencinin seçtiği dönem
    status: applicationStatusEnum('status').default('draft').notNull(),
    isExemptionRequested: boolean('is_exemption_requested').default(false).notNull(),
    answersJson: text('answers_json'), // EAV alternatifi olarak Json string
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const referenceStatusEnum = pgEnum('reference_status', ['pending', 'approved', 'rejected']);
export const referenceTitleEnum = pgEnum('reference_title', ['muhtar', 'teacher', 'other']);

// References (Referans Onayları)
export const references = pgTable('references', {
    id: uuid('id').defaultRandom().primaryKey(),
    applicationId: uuid('application_id').references(() => applications.id).notNull(),
    userId: uuid('user_id').references(() => users.id),
    email: text('email').notNull().default(''),
    fullName: text('full_name').notNull().default(''),
    title: referenceTitleEnum('title').notNull().default('other'),
    status: referenceStatusEnum('status').default('pending').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Fund Selections (Sponsorun Bursiyerleri Seçmesi)
export const fundSelections = pgTable('fund_selections', {
    id: uuid('id').defaultRandom().primaryKey(),
    fundId: uuid('fund_id').references(() => funds.id).notNull(),
    applicationId: uuid('application_id').references(() => applications.id).notNull(),
    sponsorId: uuid('sponsor_id').references(() => users.id), // Hangi kullanıcının bu öğrenciyi üstlendiği
    amount: integer('amount').notNull(),
    paymentType: text('payment_type', { enum: ['one_time', 'monthly'] }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'cancelled']);

export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: varchar('tenant_id').notNull(),
    fundId: uuid('fund_id').references(() => funds.id).notNull(),
    applicationId: uuid('application_id').references(() => applications.id),
    userId: uuid('user_id').references(() => users.id),
    amount: integer('amount').notNull(),
    status: paymentStatusEnum('status').default('pending').notNull(),
    paymentMethod: text('payment_method').default('wire_transfer'), // 'wire_transfer' | 'subscription'
    paymentDate: timestamp('payment_date'),
    receiptUrl: varchar('receipt_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// End of Payments table

// Student Payment Logs (Vakıf'tan öğrenciye yapılan ödemeler)
export const studentPaymentLogs = pgTable('student_payment_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    applicationId: uuid('application_id').references(() => applications.id).notNull(),
    fundId: uuid('fund_id').references(() => funds.id).notNull(),
    amount: integer('amount').notNull(),
    paymentDate: timestamp('payment_date').defaultNow().notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fund Invitations (Davetler)
export const fundInvitations = pgTable('fund_invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    fundId: uuid('fund_id').references(() => funds.id).notNull(),
    inviterId: uuid('inviter_id').references(() => users.id).notNull(),
    inviteeId: uuid('invitee_id').references(() => users.id), // Zaten kayıtlıysa doğrudan hesap eşleşir
    inviteeEmail: text('invitee_email').notNull(),
    inviteePhone: text('invitee_phone'),
    inviteeName: text('invitee_name').notNull(),
    role: text('role', { enum: ['bursiyer', 'bursveren', 'referans'] }).notNull(),
    status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Contracts & Agreements ---

export const contractTypeEnum = pgEnum('contract_type', ['KVKK', 'USER_AGREEMENT', 'STUDENT_AGREEMENT', 'WEB_KVKK', 'WEB_DONATION_AGREEMENT', 'OTHER']);

export const contracts = pgTable('contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: contractTypeEnum('type').notNull(),
    version: text('version').notNull(), // e.g. "1.0", "2024-02-19"
    title: text('title').notNull(),
    content: text('content').notNull(), // HTML or Markdown
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userContracts = pgTable('user_contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    contractId: uuid('contract_id').references(() => contracts.id).notNull(),
    acceptedAt: timestamp('accepted_at').defaultNow().notNull(),
});

// --- Notifications & Web Push ---

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    type: text('type', { enum: ['payment', 'application', 'reference', 'system'] }).notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    actionUrl: text('action_url'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    userIdx: index('notifications_user_idx').on(t.userId),
}));

export const userNotificationSettings = pgTable('user_notification_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    notifyPayments: boolean('notify_payments').default(true).notNull(),
    notifyApplications: boolean('notify_applications').default(true).notNull(),
    notifyReferences: boolean('notify_references').default(true).notNull(),
    notifySystem: boolean('notify_system').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.tenantId, t.userId),
}));

export const pushSubscriptions = pgTable('push_subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemParameters = pgTable('system_parameters', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    key: varchar('key', { length: 255 }).notNull(),
    value: text('value').notNull(),
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.tenantId, t.key),
}));

// --- External API & Public Donations ---

export const tenantApiTokens = pgTable('tenant_api_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    token: text('token').notNull().unique(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tokenIdx: index('tenant_api_tokens_token_idx').on(t.token),
}));

export const donationStatusEnum = pgEnum('donation_status', ['completed', 'failed', 'refunded', 'pending']);

export const donations = pgTable('donations', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    amount: integer('amount').notNull(),
    donorName: text('donor_name'),
    donorTc: text('donor_tc'),
    donorEmail: text('donor_email'),
    donorPhone: text('donor_phone'),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    isFbiadMember: boolean('is_fbiad_member').default(false).notNull(),
    wantsMembershipInfo: boolean('wants_membership_info').default(false).notNull(),
    paymentMethod: text('payment_method').default('credit_card').notNull(),
    receiptUrl: text('receipt_url'),
    bankTransactionId: text('bank_transaction_id'),
    bankCode: text('bank_code'),
    status: donationStatusEnum('status').default('completed').notNull(),
    agreementsAccepted: boolean('agreements_accepted').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
    tenantUsers: many(tenantUsers),
    ownedFunds: many(funds),
    fundContributions: many(fundContributors),
    applications: many(applications),
    referenceTokens: many(references),
    sentInvitations: many(fundInvitations, { relationName: 'inviter' }),
    receivedInvitations: many(fundInvitations, { relationName: 'invitee' }),
    acceptedContracts: many(userContracts),
    notifications: many(notifications),
    notificationSettings: many(userNotificationSettings),
    pushSubscriptions: many(pushSubscriptions),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
    user: one(users, {
        fields: [tenantUsers.userId],
        references: [users.id],
    }),
    tenant: one(tenants, {
        fields: [tenantUsers.tenantId],
        references: [tenants.id],
    }),
}));

export const fundsRelations = relations(funds, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [funds.tenantId],
        references: [tenants.id],
    }),
    owner: one(users, {
        fields: [funds.ownerId],
        references: [users.id],
    }),
    contributors: many(fundContributors),
    applications: many(applications),
    selections: many(fundSelections),
    invitations: many(fundInvitations),
    payments: many(payments),
}));

export const fundContributorsRelations = relations(fundContributors, ({ one }) => ({
    fund: one(funds, {
        fields: [fundContributors.fundId],
        references: [funds.id],
    }),
    user: one(users, {
        fields: [fundContributors.userId],
        references: [users.id],
    }),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [applications.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [applications.userId],
        references: [users.id],
    }),
    fund: one(funds, {
        fields: [applications.fundId],
        references: [funds.id],
    }),
    form: one(applicationForms, {
        fields: [applications.formId],
        references: [applicationForms.id],
    }),
    references: many(references),
    selections: many(fundSelections),
}));

export const applicationFormsRelations = relations(applicationForms, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [applicationForms.tenantId],
        references: [tenants.id],
    }),
    applications: many(applications),
}));

export const referencesRelations = relations(references, ({ one }) => ({
    application: one(applications, {
        fields: [references.applicationId],
        references: [applications.id],
    }),
    user: one(users, {
        fields: [references.userId],
        references: [users.id],
    }),
}));

export const fundSelectionsRelations = relations(fundSelections, ({ one }) => ({
    fund: one(funds, {
        fields: [fundSelections.fundId],
        references: [funds.id],
    }),
    application: one(applications, {
        fields: [fundSelections.applicationId],
        references: [applications.id],
    }),
    sponsor: one(users, {
        fields: [fundSelections.sponsorId],
        references: [users.id],
    }),
}));

export const fundInvitationsRelations = relations(fundInvitations, ({ one }) => ({
    fund: one(funds, {
        fields: [fundInvitations.fundId],
        references: [funds.id],
    }),
    inviter: one(users, {
        fields: [fundInvitations.inviterId],
        references: [users.id],
        relationName: 'inviter'
    }),
    invitee: one(users, {
        fields: [fundInvitations.inviteeId],
        references: [users.id],
        relationName: 'invitee'
    }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    fund: one(funds, {
        fields: [payments.fundId],
        references: [funds.id],
    }),
    application: one(applications, {
        fields: [payments.applicationId],
        references: [applications.id],
    }),
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
}));

export const studentPaymentLogsRelations = relations(studentPaymentLogs, ({ one }) => ({
    tenant: one(tenants, {
        fields: [studentPaymentLogs.tenantId],
        references: [tenants.id],
    }),
    fund: one(funds, {
        fields: [studentPaymentLogs.fundId],
        references: [funds.id],
    }),
    application: one(applications, {
        fields: [studentPaymentLogs.applicationId],
        references: [applications.id],
    }),
}));

export const contractsRelations = relations(contracts, ({ many }) => ({
    acceptances: many(userContracts),
}));

export const userContractsRelations = relations(userContracts, ({ one }) => ({
    user: one(users, {
        fields: [userContracts.userId],
        references: [users.id],
    }),
    contract: one(contracts, {
        fields: [userContracts.contractId],
        references: [contracts.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    tenant: one(tenants, {
        fields: [notifications.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const userNotificationSettingsRelations = relations(userNotificationSettings, ({ one }) => ({
    tenant: one(tenants, {
        fields: [userNotificationSettings.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [userNotificationSettings.userId],
        references: [users.id],
    }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
    user: one(users, {
        fields: [pushSubscriptions.userId],
        references: [users.id],
    }),
}));

// Moka Tokens (Aylık Otomatik Çekim için)
export const mokaTokens = pgTable('moka_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    tokenCode: text('token_code').notNull(),
    cardMask: text('card_mask'), // e.g. "5549 **** **** 1234" (if provided by Moka)
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mokaTokensRelations = relations(mokaTokens, ({ one }) => ({
    user: one(users, {
        fields: [mokaTokens.userId],
        references: [users.id],
    }),
}));

export const tenantApiTokensRelations = relations(tenantApiTokens, ({ one }) => ({
    tenant: one(tenants, {
        fields: [tenantApiTokens.tenantId],
        references: [tenants.id],
    }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
    tenant: one(tenants, {
        fields: [donations.tenantId],
        references: [tenants.id],
    }),
}));
