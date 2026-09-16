import { z } from "./zod";

export const dictationTypes = ["DICTATION", "SPELLING", "EJAAN", "MEMORIZATION", "RENCANA"] as const;
export const dictationTypeLabels = { DICTATION: "听写", SPELLING: "Spelling", EJAAN: "Ejaan", MEMORIZATION: "默写", RENCANA: "Rencana" };
export const dictationSources = ["SCHOOL", "TUITION"] as const;
export const dictationSourceLabels = { SCHOOL: "学校", TUITION: "补习" };
export const dictationIdSchema = z.uuid("听写信息无效。");
export const dictationFormSchema = z.object({
  schoolClassId: z.uuid("请选择已启用的班级。"),
  studentIds: z.array(z.uuid()).min(1, "请选择至少一位学生。").max(500),
  source: z.enum(dictationSources),
  type: z.enum(dictationTypes),
  contentFormat: z.enum(["NUMBERED", "PLAIN"]).default("PLAIN"),
  description: z.string().trim().min(1, "请填写听写内容。").max(5000),
  assignedDate: z.iso.date("请填写有效的安排日期。"),
  scheduledDate: z.iso.date("请填写有效的听写日期。"),
}).refine((value) => value.scheduledDate >= value.assignedDate, { path: ["scheduledDate"], message: "听写日期不能早于安排日期。" });
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
