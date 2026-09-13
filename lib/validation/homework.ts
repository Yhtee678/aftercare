import { z } from "zod";

export const homeworkIdSchema = z.uuid("Invalid homework reference.");
const optionalPage = z.union([
  z.literal("").transform(() => null), z.null(),
  z.number(), z.string().trim().regex(/^\d+$/, "Enter a whole page number.").transform(Number),
]).pipe(z.number().int().min(1, "Pages start at 1.").max(2147483647).nullable());
export const homeworkFormSchema = z.object({
  schoolClassId: z.uuid("Select an active school class."),
  subject: z.string().trim().min(1, "Enter the subject.").max(200),
  description: z.string().trim().min(1, "Describe the homework.").max(5000),
  taskType: z.string().trim().max(200).transform((value) => value || null),
  pageFrom: optionalPage,
  pageTo: optionalPage,
  taskDate: z.iso.date("Enter a valid task date."),
}).refine((value) => value.pageTo === null || (value.pageFrom !== null && value.pageTo >= value.pageFrom), {
  path: ["pageTo"], message: "Enter a starting page and an ending page at or after it.",
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
