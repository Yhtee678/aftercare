import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dictationTasks, schoolClasses, schools, studentDictation, students } from "@/db/schema";
import { canChangeDictationStatus, createDictationSchema, changeDictationStatusSchema, type CreateDictationInput, type DictationResult } from "@/lib/validation/dictation";

function matches(task: typeof dictationTasks.$inferSelect, input: CreateDictationInput) {
  return task.scope === "CLASS" && task.schoolClassId === input.schoolClassId
    && task.contentFormat === input.contentFormat && task.type === input.type && task.description === input.description && task.source === input.source
    && task.assignedDate === input.assignedDate && task.scheduledDate === input.scheduledDate;
}

export async function insertClassDictation(raw: unknown): Promise<DictationResult> {
  const parsed = createDictationSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "请检查听写内容后重试。" };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    // Serialize retries of this form, including a retry after the first response was lost.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.submissionId}, 0))`);
    const [existing] = await tx.select().from(dictationTasks).where(eq(dictationTasks.id, input.submissionId));
    if (existing) return matches(existing, input)
      ? { success: true, id: existing.id }
      : { success: false, message: "此表单已保存其他资料，请重新打开“添加听写”。" };
    const [schoolClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).for("share");
    if (!schoolClass) return { success: false, message: "此班级或学校已停用或不可用，请选择已启用的班级。" };
    const roster = await tx.select({ id: students.id }).from(students)
      .where(and(eq(students.schoolClassId, schoolClass.id), eq(students.status, "ACTIVE"))).for("share");
    if (!roster.length) return { success: false, message: "此班级暂无启用的学生，请先添加学生再分配听写。" };
    await tx.insert(dictationTasks).values({
      id: input.submissionId, scope: "CLASS", schoolClassId: input.schoolClassId,
      contentFormat: input.contentFormat, type: input.type, description: input.description, source: input.source,
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
  if (!parsed.success) return { success: false, message: "听写更新无效。" };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(studentDictation).where(eq(studentDictation.id, input.id)).for("update");
    if (!existing) return { success: false, message: "找不到此学生的任务，请刷新后重试。" };
    if (existing.status === "NEEDS_PRACTICE" && input.status === "NEEDS_PRACTICE") return { success: true, id: existing.dictationTaskId };
    if (!canChangeDictationStatus(existing.status, input.status)) return { success: false, message: "此听写已检查或已更新，请刷新查看目前状态。" };
    await tx.update(studentDictation).set({ status: input.status, verifiedAt: input.status === "COMPLETED" ? sql`now()` : null, updatedAt: sql`now()` })
      .where(and(eq(studentDictation.id, existing.id), eq(studentDictation.status, existing.status)));
    return { success: true, id: existing.dictationTaskId };
  });
}
