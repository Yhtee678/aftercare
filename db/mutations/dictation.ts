import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dictationTasks, schoolClasses, schools, studentDictation, students } from "@/db/schema";
import { canChangeDictationStatus, createDictationSchema, changeDictationStatusSchema, type CreateDictationInput, type DictationResult } from "@/lib/validation/dictation";

function matches(task: typeof dictationTasks.$inferSelect, input: CreateDictationInput) {
  return task.scope === "CLASS" && task.schoolClassId === input.schoolClassId
    && task.type === input.type && task.description === input.description && task.source === input.source
    && task.assignedDate === input.assignedDate && task.scheduledDate === input.scheduledDate;
}

export async function insertClassDictation(raw: unknown): Promise<DictationResult> {
  const parsed = createDictationSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Check the dictation details and try again." };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    // Serialize retries of this form, including a retry after the first response was lost.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.submissionId}, 0))`);
    const [existing] = await tx.select().from(dictationTasks).where(eq(dictationTasks.id, input.submissionId));
    if (existing) return matches(existing, input)
      ? { success: true, id: existing.id }
      : { success: false, message: "This form was already saved with different details. Open Add Dictation again." };
    const [schoolClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).for("share");
    if (!schoolClass) return { success: false, message: "This class or school is inactive or unavailable. Choose an active class." };
    const roster = await tx.select({ id: students.id }).from(students)
      .where(and(eq(students.schoolClassId, schoolClass.id), eq(students.status, "ACTIVE"))).for("share");
    if (!roster.length) return { success: false, message: "This class has no active students. Add an active student before assigning dictation." };
    await tx.insert(dictationTasks).values({
      id: input.submissionId, scope: "CLASS", schoolClassId: input.schoolClassId,
      type: input.type, description: input.description, source: input.source,
      assignedDate: input.assignedDate, scheduledDate: input.scheduledDate,
    });
    await tx.insert(studentDictation).values(roster.map((student) => ({
      studentId: student.id, dictationTaskId: input.submissionId, status: "PENDING" as const,
    })));
    return { success: true, id: input.submissionId };
  });
}

export async function updateDictationStatus(raw: unknown): Promise<DictationResult> {
  const parsed = changeDictationStatusSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Invalid dictation update." };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(studentDictation).where(eq(studentDictation.id, input.id)).for("update");
    if (!existing) return { success: false, message: "This student assignment is unavailable. Refresh and try again." };
    if (existing.status === "NEEDS_PRACTICE" && input.status === "NEEDS_PRACTICE") return { success: true, id: existing.dictationTaskId };
    if (!canChangeDictationStatus(existing.status, input.status)) return { success: false, message: "This dictation has already been checked or changed. Refresh to see its current status." };
    await tx.update(studentDictation).set({ status: input.status, verifiedAt: input.status === "COMPLETED" ? sql`now()` : null, updatedAt: sql`now()` })
      .where(and(eq(studentDictation.id, existing.id), eq(studentDictation.status, existing.status)));
    return { success: true, id: existing.dictationTaskId };
  });
}
