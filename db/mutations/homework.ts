import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { homeworkTasks, schoolClasses, schools, studentHomework, students } from "@/db/schema";
import { canChangeHomeworkStatus, createHomeworkSchema, changeHomeworkStatusSchema, type CreateHomeworkInput, type HomeworkResult } from "@/lib/validation/homework";

function matches(task: typeof homeworkTasks.$inferSelect, input: CreateHomeworkInput) {
  return task.scope === "CLASS" && task.schoolClassId === input.schoolClassId
    && task.subject === input.subject && task.description === input.description
    && task.taskType === input.taskType && task.taskDate === input.taskDate
    && task.pageFrom === input.pageFrom && task.pageTo === input.pageTo;
}

export async function insertClassHomework(raw: unknown): Promise<HomeworkResult> {
  const parsed = createHomeworkSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "请检查功课内容后重试。" };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    // Serialize retries of this form, including a retry after the first response was lost.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.submissionId}, 0))`);
    const [existing] = await tx.select().from(homeworkTasks).where(eq(homeworkTasks.id, input.submissionId));
    if (existing) return matches(existing, input)
      ? { success: true, id: existing.id }
      : { success: false, message: "此表单已保存其他资料，请重新打开“添加功课”。" };
    const [schoolClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).for("share");
    if (!schoolClass) return { success: false, message: "此班级或学校已停用或不可用，请选择已启用的班级。" };
    const roster = await tx.select({ id: students.id }).from(students)
      .where(and(eq(students.schoolClassId, schoolClass.id), eq(students.status, "ACTIVE"))).for("share");
    if (new Set(input.studentIds).size !== input.studentIds.length || input.studentIds.some((id) => !roster.some((student) => student.id === id)))
      return { success: false, message: "所选学生不属于此班级或已停用。" };
    await tx.insert(homeworkTasks).values({
      id: input.submissionId, scope: "CLASS", schoolClassId: input.schoolClassId,
      subject: input.subject, description: input.description, taskType: input.taskType,
      pageFrom: input.pageFrom, pageTo: input.pageTo, taskDate: input.taskDate,
    });
    await tx.insert(studentHomework).values(input.studentIds.map((studentId) => ({
      studentId, homeworkTaskId: input.submissionId, status: "PENDING" as const,
    })));
    return { success: true, id: input.submissionId };
  });
}

export async function updateHomeworkStatus(raw: unknown): Promise<HomeworkResult> {
  const parsed = changeHomeworkStatusSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "功课更新无效。" };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(studentHomework).where(eq(studentHomework.id, input.id)).for("update");
    if (!existing) return { success: false, message: "找不到此学生的任务，请刷新后重试。" };
    if (!canChangeHomeworkStatus(existing.status, input.status)) return { success: false, message: "此功课已检查或已更新，请刷新查看目前状态。" };
    await tx.update(studentHomework).set({ status: input.status, checkedAt: sql`now()`, updatedAt: sql`now()` })
      .where(and(eq(studentHomework.id, existing.id), eq(studentHomework.status, existing.status)));
    return { success: true, id: existing.homeworkTaskId };
  });
}
