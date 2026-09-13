import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import type { CreateSchoolInput, EditSchoolInput, DeactivateSchoolInput, SchoolMutationResult } from "@/lib/validation/school";

export async function insertSchool(input: CreateSchoolInput): Promise<SchoolMutationResult> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(schools).values({ id: input.submissionId, name: input.name, status: "ACTIVE" })
      .onConflictDoNothing({ target: schools.id }).returning({ id: schools.id });
    if (created) return { success: true, id: created.id };
    // The form UUID is the primary key; retries cannot insert a second school.
    const [existing] = await tx.select({ id: schools.id, name: schools.name }).from(schools)
      .where(eq(schools.id, input.submissionId)).limit(1);
    if (existing?.name === input.name) return { success: true, id: existing.id };
    return { success: false, message: "This form has already been used with different details. Open Add School again." };
  });
}

export async function updateSchool(input: EditSchoolInput): Promise<SchoolMutationResult> {
  return db.transaction(async (tx) => {
    const [school] = await tx.select().from(schools).where(eq(schools.id, input.id)).limit(1).for("update");
    if (!school) return { success: false, message: "School not found. Return to Schools and try again." };
    if (school.name === input.name) return { success: true, id: school.id };
    await tx.update(schools).set({ name: input.name, updatedAt: sql`now()` }).where(eq(schools.id, school.id));
    return { success: true, id: school.id };
  });
}

export async function markSchoolInactive(input: DeactivateSchoolInput): Promise<SchoolMutationResult> {
  return db.transaction(async (tx) => {
    const [school] = await tx.select({ id: schools.id, status: schools.status }).from(schools)
      .where(eq(schools.id, input.id)).limit(1).for("update");
    if (!school) return { success: false, message: "School not found. Return to Schools and try again." };
    if (school.status === "INACTIVE") return { success: true, id: school.id };
    await tx.update(schools).set({ status: "INACTIVE", updatedAt: sql`now()` })
      .where(and(eq(schools.id, school.id), eq(schools.status, "ACTIVE")));
    return { success: true, id: school.id };
  });
}
