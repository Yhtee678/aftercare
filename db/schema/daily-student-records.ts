import { boolean, date, index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { students } from "./students";
import { schoolClasses } from "./school-classes";

export const dailyStudentRecords = pgTable("daily_student_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "restrict" }),
  recordDate: date("record_date").notNull(),
  // Immutable context captured on the first daily action, not derived from current enrollment.
  schoolClassId: uuid("school_class_id").notNull().references(() => schoolClasses.id, { onDelete: "restrict" }),
  schoolName: text("school_name").notNull(),
  className: text("class_name").notNull(),
  grade: integer("grade").notNull(),
  academicYear: integer("academic_year").notNull(),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }),
  mealCompleted: boolean("meal_completed").default(false).notNull(),
  showerCompleted: boolean("shower_completed").default(false).notNull(),
  bagChecked: boolean("bag_checked").default(false).notNull(),
  finalCheckCompleted: boolean("final_check_completed").default(false).notNull(),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("daily_student_records_student_date_unique").on(table.studentId, table.recordDate),
  index("daily_student_records_class_date_idx").on(table.schoolClassId, table.recordDate),
]);
