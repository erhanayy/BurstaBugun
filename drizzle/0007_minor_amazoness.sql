CREATE TYPE "public"."donation_status" AS ENUM('completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"donor_name" text,
	"donor_tc" text,
	"donor_email" text,
	"donor_phone" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"is_fbiad_member" boolean DEFAULT false NOT NULL,
	"wants_membership_info" boolean DEFAULT false NOT NULL,
	"bank_transaction_id" text,
	"bank_code" text,
	"status" "donation_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parameters_tenant_seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"app_start_date" timestamp,
	"app_end_date" timestamp,
	"fund_start_date" timestamp,
	"fund_end_date" timestamp,
	"default_fund_amount" integer,
	"default_fund_duration" integer,
	"default_fund_start_date" timestamp,
	"default_fund_end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parameters_tenant_seasons_tenant_id_period_unique" UNIQUE("tenant_id","period")
);
--> statement-breakpoint
CREATE TABLE "tenant_api_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"token" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_api_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "system_parameters" DROP CONSTRAINT "system_parameters_key_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_number_unique";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "fund_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "period" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "is_exemption_requested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fund_selections" ADD COLUMN "sponsor_id" uuid;--> statement-breakpoint
ALTER TABLE "system_parameters" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD CONSTRAINT "parameters_tenant_seasons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_api_tokens" ADD CONSTRAINT "tenant_api_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenant_api_tokens_token_idx" ON "tenant_api_tokens" USING btree ("token");--> statement-breakpoint
ALTER TABLE "fund_selections" ADD CONSTRAINT "fund_selections_sponsor_id_users_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_parameters" ADD CONSTRAINT "system_parameters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_parameters" ADD CONSTRAINT "system_parameters_tenant_id_key_unique" UNIQUE("tenant_id","key");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_tenant_id_unique" UNIQUE("phone_number","tenant_id");