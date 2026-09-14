"use server";

import { revalidatePath } from "next/cache";
import { createHomeworkSchema, changeHomeworkStatusSchema, type HomeworkResult } from "@/lib/validation/homework";

function refreshHomework(id: string) {
  revalidatePath("/homework");
  revalidatePath(`/homework/${id}`);
}

export async function createHomework(input: unknown): Promise<HomeworkResult> {
  const parsed = createHomeworkSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "请检查功课内容。" };
  try {
    const { insertClassHomework } = await import("@/db/mutations/homework");
    const result = await insertClassHomework(input);
    if (result.success) refreshHomework(result.id);
    return result;
  } catch {
    console.error("Homework creation: transaction or revalidation failed.");
    return { success: false, message: "暂时无法保存功课，请使用此表单重试。" };
  }
}

export async function changeHomeworkStatus(input: unknown): Promise<HomeworkResult> {
  if (!changeHomeworkStatusSchema.safeParse(input).success) return { success: false, message: "功课更新无效。" };
  try {
    const { updateHomeworkStatus } = await import("@/db/mutations/homework");
    const result = await updateHomeworkStatus(input);
    // Refresh even a rejected stale transition so the teacher sees the actual state.
    revalidatePath("/homework", "layout");
    return result;
  } catch {
    console.error("Homework check: update or revalidation failed.");
    return { success: false, message: "暂时无法确认更新结果，请刷新查看状态后重试。" };
  }
}
