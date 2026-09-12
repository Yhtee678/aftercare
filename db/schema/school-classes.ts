import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { recordStatus } from "./status";

export const schoolClasses = pgTable("school_classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull()
    .references(() => schools.id, { onDelete: "restrict" }),
  grade: integer("grade").notNull(),
  className: text("class_name").notNull(),
  academicYear: integer("academic_year").notNull(),
  status: recordStatus("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  unique("school_classes_school_year_grade_name_unique")
    .on(table.schoolId, table.academicYear, table.grade, table.className),
]);
