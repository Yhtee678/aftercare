import { sql } from "drizzle-orm";
import { check, date, index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { schoolClasses } from "./school-classes";
import { students } from "./students";

export const homeworkScope = pgEnum("homework_scope", ["CLASS", "INDIVIDUAL"]);
export const homeworkStatus = pgEnum("homework_status", ["PENDING", "CORRECTION_REQUIRED", "COMPLETED"]);

export const homeworkTasks = pgTable("homework_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  scope: homeworkScope("scope").notNull(),
  schoolClassId: uuid("school_class_id").references(() => schoolClasses.id, { onDelete: "restrict" }),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "restrict" }),
  subject: text("subject").notNull(),
  taskType: text("task_type"),
  description: text("description").notNull(),
  pageFrom: integer("page_from"),
  pageTo: integer("page_to"),
  taskDate: date("task_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("homework_tasks_scope_target_check", sql`(${table.scope} = 'CLASS' AND ${table.schoolClassId} IS NOT NULL AND ${table.studentId} IS NULL) OR (${table.scope} = 'INDIVIDUAL' AND ${table.studentId} IS NOT NULL AND ${table.schoolClassId} IS NULL)`),
  index("homework_tasks_class_date_idx").on(table.schoolClassId, table.taskDate),
  index("homework_tasks_student_date_idx").on(table.studentId, table.taskDate),
]);

export const studentHomework = pgTable("student_homework", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "restrict" }),
  homeworkTaskId: uuid("homework_task_id").notNull().references(() => homeworkTasks.id, { onDelete: "restrict" }),
  status: homeworkStatus("status").default("PENDING").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("student_homework_student_task_unique").on(table.studentId, table.homeworkTaskId),
  index("student_homework_task_idx").on(table.homeworkTaskId),
]);
