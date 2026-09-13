CREATE TYPE "homework_scope" AS ENUM('CLASS', 'INDIVIDUAL');--> statement-breakpoint
CREATE TYPE "homework_status" AS ENUM('PENDING', 'CORRECTION_REQUIRED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "homework_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scope" "homework_scope" NOT NULL,
	"school_class_id" uuid,
	"student_id" uuid,
	"subject" text NOT NULL,
	"task_type" text,
	"description" text NOT NULL,
	"page_from" integer,
	"page_to" integer,
	"task_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "homework_tasks_scope_target_check" CHECK (("scope" = 'CLASS' AND "school_class_id" IS NOT NULL AND "student_id" IS NULL) OR ("scope" = 'INDIVIDUAL' AND "student_id" IS NOT NULL AND "school_class_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "student_homework" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"homework_task_id" uuid NOT NULL,
	"status" "homework_status" DEFAULT 'PENDING'::"homework_status" NOT NULL,
	"checked_at" timestamp with time zone,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_homework_student_task_unique" UNIQUE("student_id","homework_task_id")
);
--> statement-breakpoint
CREATE INDEX "homework_tasks_class_date_idx" ON "homework_tasks" ("school_class_id","task_date");--> statement-breakpoint
CREATE INDEX "homework_tasks_student_date_idx" ON "homework_tasks" ("student_id","task_date");--> statement-breakpoint
CREATE INDEX "student_homework_task_idx" ON "student_homework" ("homework_task_id");--> statement-breakpoint
ALTER TABLE "homework_tasks" ADD CONSTRAINT "homework_tasks_school_class_id_school_classes_id_fkey" FOREIGN KEY ("school_class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "homework_tasks" ADD CONSTRAINT "homework_tasks_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "student_homework" ADD CONSTRAINT "student_homework_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "student_homework" ADD CONSTRAINT "student_homework_homework_task_id_homework_tasks_id_fkey" FOREIGN KEY ("homework_task_id") REFERENCES "homework_tasks"("id") ON DELETE RESTRICT;