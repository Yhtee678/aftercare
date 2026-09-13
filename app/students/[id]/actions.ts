"use server";

import { revalidatePath } from "next/cache";
import { deactivateStudentSchema, type DeactivateStudentResult } from "@/lib/validation/student";

export async function deactivateStudent(input: unknown): Promise<DeactivateStudentResult> {
  const parsed = deactivateStudentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Confirm deactivation for a valid student and try again." };
  try {
    const { markStudentInactive } = await import("@/db/mutations/students");
    const result = await markStudentInactive(parsed.data);
    if (result.success) {
      revalidatePath("/students");
      revalidatePath(`/students/${result.id}`);
      revalidatePath(`/students/${result.id}/edit`);
    }
    return result;
  } catch {
    console.error("Deactivate Student: database update or revalidation failed.");
    return { success: false, message: "Unable to deactivate the student. Please try again." };
  }
}
