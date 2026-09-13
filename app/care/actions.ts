"use server";

import { revalidatePath } from "next/cache";
import { careActionSchema, type CareResult } from "@/lib/validation/care";

export async function completeCareAction(raw: unknown): Promise<CareResult> {
  const parsed = careActionSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Invalid care action. Refresh and try again." };
  try {
    const { recordCareAction } = await import("@/db/mutations/care");
    const result = await recordCareAction(parsed.data);
    revalidatePath(`/care/classes/${parsed.data.schoolClassId}`);
    return result;
  } catch {
    console.error("Daily Care: action or revalidation failed.");
    return { success: false, message: "Unable to confirm the care update. Please retry; completed actions will not be recorded twice." };
  }
}
