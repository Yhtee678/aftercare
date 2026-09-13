import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";

export function getSchools() {
  return db.select({ id: schools.id, name: schools.name, status: schools.status })
    .from(schools).orderBy(asc(schools.name), asc(schools.id));
}

export async function getSchool(id: string) {
  const [school] = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
  return school;
}
