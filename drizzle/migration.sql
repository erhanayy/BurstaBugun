CREATE TABLE "student_payment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"fund_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
;
ALTER TABLE "payments" ALTER COLUMN "application_id" DROP NOT NULL;;
ALTER TABLE "funds" ADD COLUMN "collected_amount" integer DEFAULT 0 NOT NULL;;
ALTER TABLE "funds" ADD COLUMN "distributed_amount" integer DEFAULT 0 NOT NULL;;
ALTER TABLE "payments" ADD COLUMN "user_id" uuid;;
ALTER TABLE "student_payment_logs" ADD CONSTRAINT "student_payment_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;;
ALTER TABLE "student_payment_logs" ADD CONSTRAINT "student_payment_logs_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;;
ALTER TABLE "student_payment_logs" ADD CONSTRAINT "student_payment_logs_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;