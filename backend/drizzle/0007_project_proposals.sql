CREATE TYPE "public"."proposal_status" AS ENUM('DRAFT', 'REVIEWED', 'APPROVED');--> statement-breakpoint
CREATE TABLE "project_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"consultation_id" uuid NOT NULL,
	"requirement_summary_id" uuid NOT NULL,
	"estimation_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"executive_summary" text NOT NULL,
	"scope_of_work" jsonb NOT NULL,
	"deliverables" jsonb NOT NULL,
	"timeline" varchar(255) NOT NULL,
	"assumptions" text NOT NULL,
	"exclusions" text NOT NULL,
	"pricing_notes" text NOT NULL,
	"proposal_markdown" text NOT NULL,
	"generated_by" "requirement_summary_generated_by" DEFAULT 'AI' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "proposal_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_requirement_summary_id_requirement_summaries_id_fk" FOREIGN KEY ("requirement_summary_id") REFERENCES "public"."requirement_summaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_proposals" ADD CONSTRAINT "project_proposals_estimation_id_project_estimations_id_fk" FOREIGN KEY ("estimation_id") REFERENCES "public"."project_estimations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_proposals_consultation_id_uidx" ON "project_proposals" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "project_proposals_organization_id_idx" ON "project_proposals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "project_proposals_requirement_summary_id_idx" ON "project_proposals" USING btree ("requirement_summary_id");--> statement-breakpoint
CREATE INDEX "project_proposals_estimation_id_idx" ON "project_proposals" USING btree ("estimation_id");