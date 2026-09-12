import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schoolClasses } from "./school-classes";
import { recordStatus } from "./status";

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  // Current class only. Future daily records must preserve their own class context.
  schoolClassId: uuid("school_class_id").notNull()
    .references(() => schoolClasses.id, { onDelete: "restrict" }),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  status: recordStatus("status").default("ACTIVE").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("students_school_class_id_idx").on(table.schoolClassId),
]);
