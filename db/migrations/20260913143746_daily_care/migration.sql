CREATE TABLE "daily_student_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"record_date" date NOT NULL,
	"school_class_id" uuid NOT NULL,
	"school_name" text NOT NULL,
	"class_name" text NOT NULL,
	"grade" integer NOT NULL,
	"academic_year" integer NOT NULL,
	"arrival_time" timestamp with time zone,
	"meal_completed" boolean DEFAULT false NOT NULL,
	"shower_completed" boolean DEFAULT false NOT NULL,
	"bag_checked" boolean DEFAULT false NOT NULL,
	"final_check_completed" boolean DEFAULT false NOT NULL,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_student_records_student_date_unique" UNIQUE("student_id","record_date")
);
--> statement-breakpoint
CREATE INDEX "daily_student_records_class_date_idx" ON "daily_student_records" ("school_class_id","record_date");--> statement-breakpoint
ALTER TABLE "daily_student_records" ADD CONSTRAINT "daily_student_records_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "daily_student_records" ADD CONSTRAINT "daily_student_records_school_class_id_school_classes_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT;