import { sql } from "drizzle-orm";
import { check, date, index, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { schoolClasses } from "./school-classes";
import { students } from "./students";

export const dictationScope = pgEnum("dictation_scope", ["CLASS", "INDIVIDUAL"]);
export const dictationType = pgEnum("dictation_type", ["DICTATION", "SPELLING", "EJAAN", "MEMORIZATION", "RENCANA"]);
export const dictationSource = pgEnum("dictation_source", ["SCHOOL", "TUITION"]);
export const dictationStatus = pgEnum("dictation_status", ["PENDING", "NEEDS_PRACTICE", "COMPLETED"]);
export const dictationTasks = pgTable("dictation_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  scope: dictationScope("scope").notNull(),
  schoolClassId: uuid("school_class_id").references(() => schoolClasses.id, { onDelete: "restrict" }),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "restrict" }),
  type: dictationType("type").notNull(), source: dictationSource("source").notNull(),
  contentFormat: text("content_format").notNull().default("PLAIN"),
  description: text("description").notNull(),
  assignedDate: date("assigned_date").notNull(), scheduledDate: date("scheduled_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("dictation_tasks_scope_target_check", sql`(${table.scope} = 'CLASS' AND ${table.schoolClassId} IS NOT NULL AND ${table.studentId} IS NULL) OR (${table.scope} = 'INDIVIDUAL' AND ${table.studentId} IS NOT NULL AND ${table.schoolClassId} IS NULL)`),
  check("dictation_tasks_content_format_check", sql`${table.contentFormat} IN ('NUMBERED', 'PLAIN')`),
  check("dictation_tasks_dates_check", sql`${table.scheduledDate} >= ${table.assignedDate}`),
  index("dictation_tasks_class_date_idx").on(table.schoolClassId, table.scheduledDate),
  index("dictation_tasks_scheduled_date_idx").on(table.scheduledDate),
]);
export const studentDictation = pgTable("student_dictation", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "restrict" }),
  dictationTaskId: uuid("dictation_task_id").notNull().references(() => dictationTasks.id, { onDelete: "restrict" }),
  status: dictationStatus("status").default("PENDING").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }), remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("student_dictation_student_task_unique").on(table.studentId, table.dictationTaskId),
  index("student_dictation_task_idx").on(table.dictationTaskId),
]);
