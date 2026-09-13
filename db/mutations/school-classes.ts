import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools } from "@/db/schema";
import type { CreateSchoolClassInput, EditSchoolClassInput, DeactivateSchoolClassInput, SchoolClassMutationResult } from "@/lib/validation/school-class";

const unavailableSchool: SchoolClassMutationResult = {
  success: false, message: "Select an active school.", fieldErrors: { schoolId: "This school is unavailable. Choose an active school." },
};
const duplicateClass: SchoolClassMutationResult = {
  success: false, message: "A class with this school, academic year, grade and name already exists.",
  fieldErrors: { className: "This class already exists for the selected school, year and grade." },
};

// Drizzle wraps driver errors in `cause`. Inspect only safe codes/constraint names.
function isDuplicateClass(error: unknown): boolean {
  let current = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    if ("code" in current && current.code === "23505" && "constraint_name" in current
      && current.constraint_name === "school_classes_school_year_grade_name_unique") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

function matches(existing: typeof schoolClasses.$inferSelect, input: CreateSchoolClassInput | EditSchoolClassInput) {
  return existing.schoolId === input.schoolId && existing.academicYear === input.academicYear
    && existing.grade === input.grade && existing.className === input.className;
}

export async function insertSchoolClass(input: CreateSchoolClassInput): Promise<SchoolClassMutationResult> {
  try {
    return await db.transaction(async (tx) => {
      const [school] = await tx.select({ id: schools.id }).from(schools)
        .where(and(eq(schools.id, input.schoolId), eq(schools.status, "ACTIVE"))).for("share");
      if (!school) return unavailableSchool;
      const [created] = await tx.insert(schoolClasses).values({
        id: input.submissionId, schoolId: input.schoolId, academicYear: input.academicYear,
        grade: input.grade, className: input.className, status: "ACTIVE",
      }).onConflictDoNothing({ target: schoolClasses.id }).returning({ id: schoolClasses.id });
      if (created) return { success: true, id: created.id };
      const [existing] = await tx.select().from(schoolClasses).where(eq(schoolClasses.id, input.submissionId)).limit(1);
      if (existing && matches(existing, input)) return { success: true, id: existing.id };
      return { success: false, message: "This form has already been used with different details. Open Add School Class again." };
    });
  } catch (error) {
    if (isDuplicateClass(error)) return duplicateClass;
    throw error;
  }
}

export async function updateSchoolClass(input: EditSchoolClassInput): Promise<SchoolClassMutationResult> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(schoolClasses).where(eq(schoolClasses.id, input.id)).limit(1).for("update");
      if (!existing) return { success: false, message: "Class not found. Return to Classes and try again." };
      const [school] = await tx.select({ id: schools.id }).from(schools)
        .where(and(eq(schools.id, input.schoolId), eq(schools.status, "ACTIVE"))).for("share");
      if (!school) return unavailableSchool;
      if (matches(existing, input)) return { success: true, id: existing.id };
      await tx.update(schoolClasses).set({
        schoolId: input.schoolId, academicYear: input.academicYear, grade: input.grade,
        className: input.className, updatedAt: sql`now()`,
      }).where(eq(schoolClasses.id, existing.id));
      return { success: true, id: existing.id };
    });
  } catch (error) {
    if (isDuplicateClass(error)) return duplicateClass;
    throw error;
  }
}

export async function markSchoolClassInactive(input: DeactivateSchoolClassInput): Promise<SchoolClassMutationResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: schoolClasses.id, status: schoolClasses.status }).from(schoolClasses)
      .where(eq(schoolClasses.id, input.id)).limit(1).for("update");
    if (!existing) return { success: false, message: "Class not found. Return to Classes and try again." };
    if (existing.status === "INACTIVE") return { success: true, id: existing.id };
    await tx.update(schoolClasses).set({ status: "INACTIVE", updatedAt: sql`now()` })
      .where(and(eq(schoolClasses.id, existing.id), eq(schoolClasses.status, "ACTIVE")));
    return { success: true, id: existing.id };
  });
}
