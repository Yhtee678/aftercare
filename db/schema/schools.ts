import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { recordStatus } from "./status";

export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: recordStatus("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow().notNull().$onUpdate(() => new Date()),
});
