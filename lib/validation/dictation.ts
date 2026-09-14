import { z } from "zod";

export const dictationTypes = ["DICTATION", "SPELLING", "EJAAN", "MEMORIZATION", "RENCANA"] as const;
export const dictationTypeLabels = { DICTATION: "Dictation", SPELLING: "Spelling", EJAAN: "Ejaan", MEMORIZATION: "默写", RENCANA: "Rencana" };
export const dictationSources = ["SCHOOL", "TUITION"] as const;
export const dictationSourceLabels = { SCHOOL: "School", TUITION: "Tuition" };
export const dictationIdSchema = z.uuid("Invalid dictation reference.");
export const dictationFormSchema = z.object({
  schoolClassId: z.uuid("Select an active school class."),
  source: z.enum(dictationSources),
  type: z.enum(dictationTypes),
  description: z.string().trim().min(1, "Describe the dictation.").max(5000),
  assignedDate: z.iso.date("Enter a valid assigned date."),
  scheduledDate: z.iso.date("Enter a valid scheduled date."),
}).refine((value) => value.scheduledDate >= value.assignedDate, { path: ["scheduledDate"], message: "Scheduled date cannot be before assigned date." });
export const createDictationSchema = dictationFormSchema.safeExtend({ submissionId: dictationIdSchema });
export const changeDictationStatusSchema = z.object({ id: dictationIdSchema, status: z.enum(["NEEDS_PRACTICE", "COMPLETED"]) });
export type DictationStatus = "PENDING" | "NEEDS_PRACTICE" | "COMPLETED";
export function canChangeDictationStatus(from: DictationStatus, to: DictationStatus) {
  return (from === "PENDING" && (to === "COMPLETED" || to === "NEEDS_PRACTICE"))
    || (from === "NEEDS_PRACTICE" && to === "COMPLETED");
}
export type DictationFormValues = z.input<typeof dictationFormSchema>;
export type CreateDictationInput = z.output<typeof createDictationSchema>;
export type DictationResult = { success: true; id: string } | { success: false; message: string };
