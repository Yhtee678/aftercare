"use server";

import { revalidatePath } from "next/cache";
import { editStudentSchema, type CreateStudentResult, type StudentField } from "@/lib/validation/student";

export async function editStudent(input: unknown): Promise<CreateStudentResult> {
  const parsed = editStudentSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<StudentField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "schoolClassId" || field === "parentName" || field === "parentPhone" || field === "notes") {
        fieldErrors[field] ??= issue.message;
      }
    }
    return { success: false, message: "Check the form details and try again.", fieldErrors };
  }
  try {
    const { updateStudent } = await import("@/db/mutations/students");
    const result = await updateStudent(parsed.data);
    if (result.success) {
      revalidatePath("/students");
      revalidatePath(`/students/${result.id}`);
      revalidatePath(`/students/${result.id}/edit`);
    }
    return result;
  } catch {
    console.error("Edit Student: database update or revalidation failed.");
    return { success: false, message: "Unable to save the student. Please try again." };
  }
}
