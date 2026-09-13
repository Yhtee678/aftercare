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
  if (!parsed.success) return { success: false, message: "Check the homework details and try again." };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    // Serialize retries of this form, including a retry after the first response was lost.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.submissionId}, 0))`);
    const [existing] = await tx.select().from(homeworkTasks).where(eq(homeworkTasks.id, input.submissionId));
    if (existing) return matches(existing, input)
      ? { success: true, id: existing.id }
      : { success: false, message: "This form was already saved with different details. Open Add Homework again." };
    const [schoolClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).for("share");
    if (!schoolClass) return { success: false, message: "This class or school is inactive or unavailable. Choose an active class." };
    const roster = await tx.select({ id: students.id }).from(students)
      .where(and(eq(students.schoolClassId, schoolClass.id), eq(students.status, "ACTIVE"))).for("share");
    if (!roster.length) return { success: false, message: "This class has no active students. Add an active student before assigning homework." };
    await tx.insert(homeworkTasks).values({
      id: input.submissionId, scope: "CLASS", schoolClassId: input.schoolClassId,
      subject: input.subject, description: input.description, taskType: input.taskType,
      pageFrom: input.pageFrom, pageTo: input.pageTo, taskDate: input.taskDate,
    });
    await tx.insert(studentHomework).values(roster.map((student) => ({
      studentId: student.id, homeworkTaskId: input.submissionId, status: "PENDING" as const,
    })));
    return { success: true, id: input.submissionId };
  });
}

export async function updateHomeworkStatus(raw: unknown): Promise<HomeworkResult> {
  const parsed = changeHomeworkStatusSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Invalid homework update." };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(studentHomework).where(eq(studentHomework.id, input.id)).for("update");
    if (!existing) return { success: false, message: "This student assignment is unavailable. Refresh and try again." };
    if (!canChangeHomeworkStatus(existing.status, input.status)) return { success: false, message: "This homework has already been checked or changed. Refresh to see its current status." };
    await tx.update(studentHomework).set({ status: input.status, checkedAt: sql`now()`, updatedAt: sql`now()` })
      .where(and(eq(studentHomework.id, existing.id), eq(studentHomework.status, existing.status)));
    return { success: true, id: existing.homeworkTaskId };
  });
}
