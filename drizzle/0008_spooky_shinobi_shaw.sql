ALTER TYPE "public"."contract_type" ADD VALUE 'WEB_KVKK' BEFORE 'OTHER';--> statement-breakpoint
ALTER TYPE "public"."contract_type" ADD VALUE 'WEB_DONATION_AGREEMENT' BEFORE 'OTHER';--> statement-breakpoint
ALTER TYPE "public"."donation_status" ADD VALUE 'pending';--> statement-breakpoint
CREATE TABLE "moka_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_code" text NOT NULL,
	"card_mask" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "payment_method" text DEFAULT 'credit_card' NOT NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "receipt_url" text;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "agreements_accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "sponsor_payment_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "sponsor_payment_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "student_payment_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "student_payment_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "season_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "parameters_tenant_seasons" ADD COLUMN "season_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_method" text DEFAULT 'wire_transfer';--> statement-breakpoint
ALTER TABLE "moka_tokens" ADD CONSTRAINT "moka_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;