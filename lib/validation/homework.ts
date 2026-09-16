import { z } from "./zod";

export const homeworkIdSchema = z.uuid("功课信息无效。");
const optionalPage = z.union([
  z.literal("").transform(() => null), z.null(),
  z.number(), z.string().trim().regex(/^\d+$/, "页数必须是整数。").transform(Number),
]).pipe(z.number().int().min(1, "页数须从1开始。").max(2147483647).nullable());
export const homeworkFormSchema = z.object({
  schoolClassId: z.uuid("请选择已启用的班级。"),
  studentIds: z.array(z.uuid()).min(1, "请选择至少一位学生。").max(500),
  subject: z.string().trim().min(1, "请填写科目。").max(200),
  description: z.string().trim().min(1, "请填写功课内容。").max(5000),
  taskType: z.string().trim().max(200).transform((value) => value || null),
  pageFrom: optionalPage,
  pageTo: optionalPage,
  taskDate: z.iso.date("请填写有效的功课日期。"),
}).refine((value) => value.pageTo === null || (value.pageFrom !== null && value.pageTo >= value.pageFrom), {
  path: ["pageTo"], message: "请填写起始页数，结束页数不能小于起始页数。",
});
export const createHomeworkSchema = homeworkFormSchema.safeExtend({ submissionId: homeworkIdSchema });
export const changeHomeworkStatusSchema = z.object({
  id: homeworkIdSchema,
  status: z.enum(["CORRECTION_REQUIRED", "COMPLETED"]),
});
export type HomeworkStatus = "PENDING" | "CORRECTION_REQUIRED" | "COMPLETED";
export function canChangeHomeworkStatus(from: HomeworkStatus, to: HomeworkStatus) {
  return (from === "PENDING" && (to === "COMPLETED" || to === "CORRECTION_REQUIRED"))
    || (from === "CORRECTION_REQUIRED" && to === "COMPLETED");
}
export type HomeworkFormValues = z.input<typeof homeworkFormSchema>;
export type CreateHomeworkInput = z.output<typeof createHomeworkSchema>;
export type HomeworkResult = { success: true; id: string } | { success: false; message: string };
