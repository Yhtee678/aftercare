import { z } from "./zod";

export const careActionSchema = z.object({
  studentId: z.uuid("学生信息无效。"),
  schoolClassId: z.uuid("班级信息无效。"),
  recordDate: z.iso.date("托育日期无效。"),
  action: z.enum(["arrival", "mealCompleted", "showerCompleted", "bagChecked", "finalCheckCompleted"]),
});
export type CareAction = z.infer<typeof careActionSchema>["action"];
export type CareResult = { success: true } | { success: false; message: string };
