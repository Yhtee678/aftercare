import { z } from "zod";
import { schoolIdSchema } from "./school";

const wholeNumber = (min: number, max: number, message: string) => z.union([
  z.number(), z.string().trim().regex(/^\d+$/, message).transform(Number),
]).pipe(z.number().int(message).min(min, message).max(max, message));

export const schoolClassIdSchema = z.uuid("This class link is invalid. Return to Classes and try again.");
export const schoolClassFormSchema = z.object({
  schoolId: schoolIdSchema,
  academicYear: wholeNumber(1000, 9999, "Enter a four-digit academic year."),
  grade: wholeNumber(1, 6, "Enter a grade from 1 to 6."),
  className: z.string().trim().min(1, "Enter the class name.").max(200, "Class name must be 200 characters or fewer."),
});
export const createSchoolClassSchema = schoolClassFormSchema.extend({ submissionId: schoolClassIdSchema });
export const editSchoolClassSchema = schoolClassFormSchema.extend({ id: schoolClassIdSchema });
export const deactivateSchoolClassSchema = z.object({ id: schoolClassIdSchema, confirmed: z.literal(true, "Confirm deactivation before continuing.") });
export type SchoolClassFormValues = z.input<typeof schoolClassFormSchema>;
export type SchoolClassField = keyof SchoolClassFormValues;
export type CreateSchoolClassInput = z.output<typeof createSchoolClassSchema>;
export type EditSchoolClassInput = z.output<typeof editSchoolClassSchema>;
export type DeactivateSchoolClassInput = z.output<typeof deactivateSchoolClassSchema>;
export type SchoolClassMutationResult =
  | { success: true; id: string }
  | { success: false; message: string; fieldErrors?: Partial<Record<SchoolClassField, string>> };
