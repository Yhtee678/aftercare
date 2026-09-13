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
  if (!parsed.success) return { success: false, message: "Check the school details and try again.", nameError: parsed.error.issues.find((issue) => issue.path[0] === "name")?.message };
  try {
    const { insertSchool } = await import("@/db/mutations/schools");
    const result = await insertSchool(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Add School: database creation or revalidation failed.");
    return { success: false, message: "Unable to add the school. Please try again using this form." };
  }
}

export async function editSchool(input: unknown): Promise<SchoolMutationResult> {
  const parsed = editSchoolSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Check the school details and try again.", nameError: parsed.error.issues.find((issue) => issue.path[0] === "name")?.message };
  try {
    const { updateSchool } = await import("@/db/mutations/schools");
    const result = await updateSchool(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Edit School: database update or revalidation failed.");
    return { success: false, message: "Unable to save the school. Please try again." };
  }
}

export async function deactivateSchool(input: unknown): Promise<SchoolMutationResult> {
  const parsed = deactivateSchoolSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Confirm deactivation for a valid school and try again." };
  try {
    const { markSchoolInactive } = await import("@/db/mutations/schools");
    const result = await markSchoolInactive(parsed.data);
    if (result.success) refreshSchoolViews(result.id);
    return result;
  } catch {
    console.error("Deactivate School: database update or revalidation failed.");
    return { success: false, message: "Unable to deactivate the school. Please try again." };
  }
}
