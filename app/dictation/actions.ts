"use server";

import { revalidatePath } from "next/cache";
import { createDictationSchema, changeDictationStatusSchema, type DictationResult } from "@/lib/validation/dictation";

function refreshDictation(id: string) {
  revalidatePath("/dictation", "layout");
  revalidatePath(`/dictation/${id}`);
  revalidatePath("/today");
}

export async function createDictation(input: unknown): Promise<DictationResult> {
  const parsed = createDictationSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Check the dictation details." };
  try {
    const { insertClassDictation } = await import("@/db/mutations/dictation");
    const result = await insertClassDictation(input);
    if (result.success) refreshDictation(result.id);
    return result;
  } catch {
    console.error("Dictation creation: transaction or revalidation failed.");
    return { success: false, message: "Unable to save dictation. Please retry using this form." };
  }
}

export async function changeDictationStatus(input: unknown): Promise<DictationResult> {
  if (!changeDictationStatusSchema.safeParse(input).success) return { success: false, message: "Invalid dictation update." };
  try {
    const { updateDictationStatus } = await import("@/db/mutations/dictation");
    const result = await updateDictationStatus(input);
    // Refresh even a rejected stale transition so the teacher sees the actual state.
    revalidatePath("/dictation", "layout");
    revalidatePath("/today");
    return result;
  } catch {
    console.error("Dictation check: update or revalidation failed.");
    return { success: false, message: "Unable to confirm the update. Refresh to check its status before trying again." };
  }
}
