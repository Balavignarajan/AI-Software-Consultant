CREATE TABLE "project_estimations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"consultation_id" uuid NOT NULL,
	"requirement_summary_id" uuid NOT NULL,
	"estimated_hours" integer NOT NULL,
	"estimated_weeks" integer NOT NULL,
	"estimated_team_size" integer NOT NULL,
	"complexity" "feature_complexity" NOT NULL,
	"confidence_score" numeric(5, 4) NOT NULL,
	"assumptions" text NOT NULL,
	"risks" jsonb NOT NULL,
	"breakdown" jsonb NOT NULL,
	"generated_by" "requirement_summary_generated_by" DEFAULT 'AI' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "project_estimations" ADD CONSTRAINT "project_estimations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_estimations" ADD CONSTRAINT "project_estimations_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_estimations" ADD CONSTRAINT "project_estimations_requirement_summary_id_requirement_summaries_id_fk" FOREIGN KEY ("requirement_summary_id") REFERENCES "public"."requirement_summaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_estimations_consultation_id_uidx" ON "project_estimations" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "project_estimations_organization_id_idx" ON "project_estimations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "project_estimations_requirement_summary_id_idx" ON "project_estimations" USING btree ("requirement_summary_id");