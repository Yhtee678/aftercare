"use server";

import { revalidatePath } from "next/cache";
import { createStudentSchema, type CreateStudentResult, type StudentField } from "@/lib/validation/student";

export async function createStudent(input: unknown): Promise<CreateStudentResult> {
  const parsed = createStudentSchema.safeParse(input);
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
    const { insertStudent } = await import("@/db/mutations/students");
    const result = await insertStudent(parsed.data);
    if (result.success) revalidatePath("/students");
    return result;
  } catch {
    // Never log raw driver errors, SQL parameters, or submitted personal details.
    console.error("Add Student: database creation or revalidation failed.");
    return { success: false, message: "Unable to add the student. Please try again." };
  }
}
