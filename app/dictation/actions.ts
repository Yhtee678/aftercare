"use server";

import { revalidatePath } from "next/cache";
import { createDictationSchema, changeDictationStatusSchema, type DictationResult } from "@/lib/validation/dictation";
import type { TaskAssignmentResult } from "@/lib/validation/task-assignment";

function refreshDictation(id: string) {
  revalidatePath("/dictation", "layout");
  revalidatePath(`/dictation/${id}`);
  revalidatePath("/today");
}

export async function createDictation(input: unknown): Promise<DictationResult> {
  const parsed = createDictationSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "请检查听写内容。" };
  try {
    const { insertClassDictation } = await import("@/db/mutations/dictation");
    const result = await insertClassDictation(input);
    if (result.success) refreshDictation(result.id);
    return result;
  } catch {
    console.error("Dictation creation: transaction or revalidation failed.");
    return { success: false, message: "暂时无法保存听写，请使用此表单重试。" };
  }
}

export async function changeDictationStatus(input: unknown): Promise<DictationResult> {
  if (!changeDictationStatusSchema.safeParse(input).success) return { success: false, message: "听写更新无效。" };
  try {
    const { updateDictationStatus } = await import("@/db/mutations/dictation");
    const result = await updateDictationStatus(input);
    // Refresh even a rejected stale transition so the teacher sees the actual state.
    revalidatePath("/dictation", "layout");
    revalidatePath("/today");
    return result;
  } catch {
    console.error("Dictation check: update or revalidation failed.");
    return { success: false, message: "暂时无法确认更新结果，请刷新查看状态后重试。" };
  }
}

export async function addDictationStudents(input: unknown): Promise<TaskAssignmentResult> {
  try {
    const { addStudentsToTask } = await import("@/db/mutations/task-assignment");
    const result = await addStudentsToTask("dictation", input);
    if (result.success) refreshDictation(result.id);
    return result;
  } catch { return { success: false, message: "无法添加学生，请重试。" }; }
}

export async function removeDictationStudent(input: unknown): Promise<TaskAssignmentResult> {
  try {
    const { removeStudentFromTask } = await import("@/db/mutations/task-assignment");
    const result = await removeStudentFromTask("dictation", input);
    if (result.success) refreshDictation(result.id);
    return result;
  } catch { return { success: false, message: "无法移除学生，请重试。" }; }
}
