"use server";

import { revalidatePath } from "next/cache";
import { createSchoolClassSchema, editSchoolClassSchema, deactivateSchoolClassSchema, type SchoolClassMutationResult, type SchoolClassField } from "@/lib/validation/school-class";
import type { ZodError } from "zod";

function invalidFields(error: ZodError): SchoolClassMutationResult {
  const fieldErrors: Partial<Record<SchoolClassField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field === "schoolId" || field === "academicYear" || field === "grade" || field === "className") fieldErrors[field] ??= issue.message;
  }
  return { success: false, message: "Check the class details and try again.", fieldErrors };
}

function refreshClassViews(id: string) {
  revalidatePath("/more/classes");
  revalidatePath(`/more/classes/${id}`);
  revalidatePath(`/more/classes/${id}/edit`);
  revalidatePath("/students", "layout");
}

export async function createSchoolClass(input: unknown): Promise<SchoolClassMutationResult> {
  const parsed = createSchoolClassSchema.safeParse(input);
  if (!parsed.success) return invalidFields(parsed.error);
  try {
    const { insertSchoolClass } = await import("@/db/mutations/school-classes");
    const result = await insertSchoolClass(parsed.data);
    if (result.success) refreshClassViews(result.id);
    return result;
  } catch {
    console.error("Add School Class: database creation or revalidation failed.");
    return { success: false, message: "Unable to add the class. Please try again using this form." };
  }
}

export async function editSchoolClass(input: unknown): Promise<SchoolClassMutationResult> {
  const parsed = editSchoolClassSchema.safeParse(input);
  if (!parsed.success) return invalidFields(parsed.error);
  try {
    const { updateSchoolClass } = await import("@/db/mutations/school-classes");
    const result = await updateSchoolClass(parsed.data);
    if (result.success) refreshClassViews(result.id);
    return result;
  } catch {
    console.error("Edit School Class: database update or revalidation failed.");
    return { success: false, message: "Unable to save the class. Please try again." };
  }
}

export async function deactivateSchoolClass(input: unknown): Promise<SchoolClassMutationResult> {
  const parsed = deactivateSchoolClassSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Confirm deactivation for a valid class and try again." };
  try {
    const { markSchoolClassInactive } = await import("@/db/mutations/school-classes");
    const result = await markSchoolClassInactive(parsed.data);
    if (result.success) refreshClassViews(result.id);
    return result;
  } catch {
    console.error("Deactivate School Class: database update or revalidation failed.");
    return { success: false, message: "Unable to deactivate the class. Please try again." };
  }
}
