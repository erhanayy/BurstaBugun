CREATE TYPE "public"."pledge_status" AS ENUM('pending', 'fulfilled');--> statement-breakpoint
CREATE TABLE "pledge_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pledge_id" uuid NOT NULL,
	"payment_id" uuid,
	"allocated_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pledges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"target_student_count" integer DEFAULT 0 NOT NULL,
	"status" "pledge_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "funds" ADD COLUMN "publish_on_website" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "funds" ADD COLUMN "show_owner_name" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "publish_on_website" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "donation_id" uuid;--> statement-breakpoint
ALTER TABLE "pledge_transactions" ADD CONSTRAINT "pledge_transactions_pledge_id_pledges_id_fk" FOREIGN KEY ("pledge_id") REFERENCES "public"."pledges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_transactions" ADD CONSTRAINT "pledge_transactions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_period_id_parameters_tenant_seasons_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."parameters_tenant_seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE no action ON UPDATE no action;