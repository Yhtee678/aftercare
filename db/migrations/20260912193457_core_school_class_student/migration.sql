CREATE TYPE "record_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "school_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"grade" integer NOT NULL,
	"class_name" text NOT NULL,
	"academic_year" integer NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_classes_school_year_grade_name_unique" UNIQUE("school_id","academic_year","grade","class_name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"school_class_id" uuid NOT NULL,
	"parent_name" text,
	"parent_phone" text,
	"status" "record_status" DEFAULT 'ACTIVE'::"record_status" NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "students_school_class_id_idx" ON "students" ("school_class_id");--> statement-breakpoint
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_class_id_school_classes_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT;