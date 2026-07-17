CREATE TABLE "feature_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"default_complexity" "feature_complexity" NOT NULL,
	"default_estimated_hours" integer NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "feature_library" ADD CONSTRAINT "feature_library_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feature_library_organization_id_idx" ON "feature_library" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "feature_library_category_idx" ON "feature_library" USING btree ("category");--> statement-breakpoint
CREATE INDEX "feature_library_name_idx" ON "feature_library" USING btree ("name");