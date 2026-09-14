"use server";

import { revalidatePath } from "next/cache";

import { careActionSchema, type CareResult } from "@/lib/validation/care";

export async function completeCareAction(raw: unknown): Promise<CareResult> {
  const parsed = careActionSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "托育操作无效，请刷新后重试。" };
  try {
    const { recordCareAction } = await import("@/db/mutations/care");
    const result = await recordCareAction(parsed.data);
    // Invalidate the dependent screens. Keeping current Care out of this list avoids
    // its full roster query in this response; the action returns the saved row.
    if (result.success) {
      revalidatePath("/today", "layout");
      revalidatePath(`/care/classes/${parsed.data.schoolClassId}/print`);
    }
    return result;
  } catch {
    console.error("Daily Care: action or revalidation failed.");
    return { success: false, message: "暂时无法确认托育更新，请重试，已完成的操作不会重复记录。" };
  }
}
