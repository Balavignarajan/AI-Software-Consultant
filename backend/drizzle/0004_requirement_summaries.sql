CREATE TYPE "public"."requirement_summary_generated_by" AS ENUM('AI', 'USER');--> statement-breakpoint
CREATE TYPE "public"."requirement_summary_status" AS ENUM('draft', 'finalized');--> statement-breakpoint
CREATE TABLE "requirement_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"consultation_id" uuid NOT NULL,
	"summary_markdown" text NOT NULL,
	"structured_summary" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "requirement_summary_status" DEFAULT 'draft' NOT NULL,
	"generated_by" "requirement_summary_generated_by" DEFAULT 'AI' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "requirement_summaries" ADD CONSTRAINT "requirement_summaries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_summaries" ADD CONSTRAINT "requirement_summaries_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "requirement_summaries_consultation_id_uidx" ON "requirement_summaries" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "requirement_summaries_organization_id_idx" ON "requirement_summaries" USING btree ("organization_id");