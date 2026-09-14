CREATE TYPE "dictation_scope" AS ENUM('CLASS', 'INDIVIDUAL');--> statement-breakpoint
CREATE TYPE "dictation_source" AS ENUM('SCHOOL', 'TUITION');--> statement-breakpoint
CREATE TYPE "dictation_status" AS ENUM('PENDING', 'NEEDS_PRACTICE', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "dictation_type" AS ENUM('DICTATION', 'SPELLING', 'EJAAN', 'MEMORIZATION', 'RENCANA');--> statement-breakpoint
CREATE TABLE "dictation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scope" "dictation_scope" NOT NULL,
	"school_class_id" uuid,
	"student_id" uuid,
	"type" "dictation_type" NOT NULL,
	"source" "dictation_source" NOT NULL,
	"description" text NOT NULL,
	"assigned_date" date NOT NULL,
	"scheduled_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dictation_tasks_scope_target_check" CHECK (("scope" = 'CLASS' AND "school_class_id" IS NOT NULL AND "student_id" IS NULL) OR ("scope" = 'INDIVIDUAL' AND "student_id" IS NOT NULL AND "school_class_id" IS NULL)),
	CONSTRAINT "dictation_tasks_dates_check" CHECK ("scheduled_date" >= "assigned_date")
);
--> statement-breakpoint
CREATE TABLE "student_dictation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"dictation_task_id" uuid NOT NULL,
	"status" "dictation_status" DEFAULT 'PENDING'::"dictation_status" NOT NULL,
	"verified_at" timestamp with time zone,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_dictation_student_task_unique" UNIQUE("student_id","dictation_task_id")
);
--> statement-breakpoint
CREATE INDEX "dictation_tasks_class_date_idx" ON "dictation_tasks" ("school_class_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "dictation_tasks_scheduled_date_idx" ON "dictation_tasks" ("scheduled_date");--> statement-breakpoint
CREATE INDEX "student_dictation_task_idx" ON "student_dictation" ("dictation_task_id");--> statement-breakpoint
ALTER TABLE "dictation_tasks" ADD CONSTRAINT "dictation_tasks_school_class_id_school_classes_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "dictation_tasks" ADD CONSTRAINT "dictation_tasks_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "student_dictation" ADD CONSTRAINT "student_dictation_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "student_dictation" ADD CONSTRAINT "student_dictation_dictation_task_id_dictation_tasks_id_fkey" FOREIGN KEY ("dictation_task_id") REFERENCES "dictation_tasks"("id") ON DELETE RESTRICT;