import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { dictationTasks, homeworkTasks, schoolClasses, studentDictation, studentHomework, students } from "@/db/schema";
import { addTaskStudentsSchema, removeTaskStudentSchema, type TaskAssignmentResult } from "@/lib/validation/task-assignment";

type Kind = "homework" | "dictation";

export async function addStudentsToTask(kind: Kind, raw: unknown): Promise<TaskAssignmentResult> {
  const parsed = addTaskStudentsSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "请选择要添加的学生。" };
  const input = parsed.data;
  if (new Set(input.studentIds).size !== input.studentIds.length) return { success: false, message: "学生选择重复。" };
  return db.transaction(async (tx) => {
    const task = kind === "homework"
      ? (await tx.select({ schoolClassId: homeworkTasks.schoolClassId }).from(homeworkTasks).where(eq(homeworkTasks.id, input.taskId)).for("update"))[0]
      : (await tx.select({ schoolClassId: dictationTasks.schoolClassId }).from(dictationTasks).where(eq(dictationTasks.id, input.taskId)).for("update"))[0];
    if (!task || task.schoolClassId !== input.schoolClassId) return { success: false, message: "任务班级无效。" };
    const [schoolClass] = await tx.select({ status: schoolClasses.status }).from(schoolClasses).where(eq(schoolClasses.id, input.schoolClassId));
    if (!schoolClass || schoolClass.status !== "ACTIVE") return { success: false, message: "此班级已停用。" };
    const roster = await tx.select({ id: students.id }).from(students).where(and(inArray(students.id, input.studentIds), eq(students.schoolClassId, input.schoolClassId), eq(students.status, "ACTIVE"))).for("share");
    if (roster.length !== input.studentIds.length) return { success: false, message: "所选学生不属于此班级或已停用。" };
    if (kind === "homework") await tx.insert(studentHomework).values(input.studentIds.map((studentId) => ({ studentId, homeworkTaskId: input.taskId }))).onConflictDoNothing({ target: [studentHomework.studentId, studentHomework.homeworkTaskId] });
    else await tx.insert(studentDictation).values(input.studentIds.map((studentId) => ({ studentId, dictationTaskId: input.taskId }))).onConflictDoNothing({ target: [studentDictation.studentId, studentDictation.dictationTaskId] });
    return { success: true, id: input.taskId };
  });
}

export async function removeStudentFromTask(kind: Kind, raw: unknown): Promise<TaskAssignmentResult> {
  const parsed = removeTaskStudentSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "学生分配无效。" };
  const { assignmentId, confirmProgress } = parsed.data;
  return db.transaction(async (tx) => {
    if (kind === "homework") {
      const [row] = await tx.select().from(studentHomework).where(eq(studentHomework.id, assignmentId)).for("update");
      if (!row) return { success: false, message: "分配记录不存在，请刷新页面。" };
      if ((row.status !== "PENDING" || row.checkedAt || row.remark) && !confirmProgress) return { success: false, message: "这位学生已有功课进度。确认后会删除其进度与分配记录。", requiresConfirmation: true };
      await tx.delete(studentHomework).where(eq(studentHomework.id, assignmentId));
      return { success: true, id: row.homeworkTaskId };
    }
    const [row] = await tx.select().from(studentDictation).where(eq(studentDictation.id, assignmentId)).for("update");
    if (!row) return { success: false, message: "分配记录不存在，请刷新页面。" };
    if ((row.status !== "PENDING" || row.verifiedAt || row.remark) && !confirmProgress) return { success: false, message: "这位学生已有听写进度。确认后会删除其进度与分配记录。", requiresConfirmation: true };
    await tx.delete(studentDictation).where(eq(studentDictation.id, assignmentId));
    return { success: true, id: row.dictationTaskId };
  });
}
