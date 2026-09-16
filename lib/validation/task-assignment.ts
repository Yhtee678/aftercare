import { z } from "./zod";

export const addTaskStudentsSchema = z.object({
  taskId: z.uuid(), schoolClassId: z.uuid(),
  studentIds: z.array(z.uuid()).min(1).max(500),
});
export const removeTaskStudentSchema = z.object({ assignmentId: z.uuid(), confirmProgress: z.boolean() });
export type TaskAssignmentResult = { success: true; id: string } | { success: false; message: string; requiresConfirmation?: boolean };
