CREATE TYPE "public"."feature_complexity" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."feature_priority" AS ENUM('HIGH', 'MEDIUM', 'LOW');--> statement-breakpoint
CREATE TABLE "detected_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"consultation_id" uuid NOT NULL,
	"requirement_summary_id" uuid NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"feature_category" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"priority" "feature_priority" NOT NULL,
	"complexity" "feature_complexity" NOT NULL,
	"confidence_score" numeric(5, 4) NOT NULL,
	"ai_reasoning" text NOT NULL,
	"manually_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "detected_features" ADD CONSTRAINT "detected_features_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detected_features" ADD CONSTRAINT "detected_features_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detected_features" ADD CONSTRAINT "detected_features_requirement_summary_id_requirement_summaries_id_fk" FOREIGN KEY ("requirement_summary_id") REFERENCES "public"."requirement_summaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "detected_features_organization_id_idx" ON "detected_features" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "detected_features_consultation_id_idx" ON "detected_features" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "detected_features_requirement_summary_id_idx" ON "detected_features" USING btree ("requirement_summary_id");