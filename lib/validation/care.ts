import { z } from "zod";

export const careActionSchema = z.object({
  studentId: z.uuid("Invalid student reference."),
  schoolClassId: z.uuid("Invalid class reference."),
  recordDate: z.iso.date("Invalid care date."),
  action: z.enum(["arrival", "mealCompleted", "showerCompleted", "bagChecked", "finalCheckCompleted"]),
});
export type CareAction = z.infer<typeof careActionSchema>["action"];
export type CareResult = { success: true } | { success: false; message: string };
