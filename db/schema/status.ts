import { pgEnum } from "drizzle-orm/pg-core";

export const recordStatus = pgEnum("record_status", ["ACTIVE", "INACTIVE"]);
