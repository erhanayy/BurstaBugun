CREATE TABLE "system_parameters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_parameters_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "primary_color" text DEFAULT '#2563EB';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "features" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD COLUMN "notify_references" boolean DEFAULT true NOT NULL;