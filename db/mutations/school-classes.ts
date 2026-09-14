import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools } from "@/db/schema";
import type { CreateSchoolClassInput, EditSchoolClassInput, DeactivateSchoolClassInput, SchoolClassMutationResult } from "@/lib/validation/school-class";

const unavailableSchool: SchoolClassMutationResult = {
  success: false, message: "请选择已启用的学校。", fieldErrors: { schoolId: "此学校不可用，请选择已启用的学校。" },
};
const duplicateClass: SchoolClassMutationResult = {
  success: false, message: "同一学校、学年、年级和名称的班级已存在。",
  fieldErrors: { className: "所选学校、学年及年级中已存在此班级。" },
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
      return { success: false, message: "此表单已保存其他资料，请重新打开“添加班级”。" };
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
      if (!existing) return { success: false, message: "找不到班级，请返回班级列表后重试。" };
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
    if (!existing) return { success: false, message: "找不到班级，请返回班级列表后重试。" };
    if (existing.status === "INACTIVE") return { success: true, id: existing.id };
    await tx.update(schoolClasses).set({ status: "INACTIVE", updatedAt: sql`now()` })
      .where(and(eq(schoolClasses.id, existing.id), eq(schoolClasses.status, "ACTIVE")));
    return { success: true, id: existing.id };
  });
}
