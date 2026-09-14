"use server";

import { revalidatePath } from "next/cache";
import { createSchoolSchema, editSchoolSchema, deactivateSchoolSchema, type SchoolMutationResult } from "@/lib/validation/school";

function refreshSchoolViews(id: string) {
  revalidatePath("/more/schools");
  revalidatePath(`/more/schools/${id}`);
  revalidatePath(`/more/schools/${id}/edit`);
  // School names and availability also appear in student pages/class selectors.
  revalidatePath("/students", "layout");
  revalidatePath("/more/classes", "layout");
}

export async function createSchool(input: unknown): Promise<SchoolMutationResult> {
  const parsed = createSchoolSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "请检查学校资料后重试。", nameError: parsed.error.issues.find((issue) => issue.path[0] === "name")?.message };
  try {
    const { insertSchool } = await import("@/db/mutations/schools");
    const result = await insertSchool(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Add School: database creation or revalidation failed.");
    return { success: false, message: "暂时无法添加学校，请使用此表单重试。" };
  }
}

export async function editSchool(input: unknown): Promise<SchoolMutationResult> {
  const parsed = editSchoolSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "请检查学校资料后重试。", nameError: parsed.error.issues.find((issue) => issue.path[0] === "name")?.message };
  try {
    const { updateSchool } = await import("@/db/mutations/schools");
    const result = await updateSchool(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Edit School: database update or revalidation failed.");
    return { success: false, message: "暂时无法保存学校，请重试。" };
  }
}

export async function deactivateSchool(input: unknown): Promise<SchoolMutationResult> {
  const parsed = deactivateSchoolSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "请确认要停用的学校后重试。" };
  try {
    const { markSchoolInactive } = await import("@/db/mutations/schools");
    const result = await markSchoolInactive(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Deactivate School: database update or revalidation failed.");
    return { success: false, message: "暂时无法停用学校，请重试。" };
  }
}
