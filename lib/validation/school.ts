import { z } from "zod";

export const schoolIdSchema = z.uuid("This school link is invalid. Return to Schools and try again.");
export const schoolFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the school name.").max(200, "School name must be 200 characters or fewer."),
});
export const createSchoolSchema = schoolFormSchema.extend({ submissionId: schoolIdSchema });
export const editSchoolSchema = schoolFormSchema.extend({ id: schoolIdSchema });
export const deactivateSchoolSchema = z.object({
  id: schoolIdSchema,
  confirmed: z.literal(true, "Confirm deactivation before continuing."),
});
export type CreateSchoolInput = z.output<typeof createSchoolSchema>;
export type EditSchoolInput = z.output<typeof editSchoolSchema>;
export type DeactivateSchoolInput = z.output<typeof deactivateSchoolSchema>;
export type SchoolMutationResult =
  | { success: true; id: string }
  | { success: false; message: string; nameError?: string };
