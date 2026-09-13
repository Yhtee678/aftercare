import { z } from "zod";

const optionalText = (max: number, label: string) => z.string()
  .trim().max(max, `${label} must be ${max} characters or fewer.`)
  .optional().transform((value) => value || null);

export const studentFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the student name.")
    .max(200, "Student name must be 200 characters or fewer."),
  schoolClassId: z.uuid("Select a school class."),
  parentName: optionalText(200, "Parent name"),
  parentPhone: optionalText(50, "Parent phone"),
  notes: optionalText(2000, "Notes"),
});

export const createStudentSchema = studentFormSchema.extend({
  submissionId: z.uuid("This form has expired. Reload it and try again."),
});

export type StudentFormValues = z.input<typeof studentFormSchema>;
export type CreateStudentInput = z.output<typeof createStudentSchema>;
export type StudentField = keyof StudentFormValues;
export type CreateStudentResult =
  | { success: true; id: string }
  | { success: false; message: string; fieldErrors?: Partial<Record<StudentField, string>> };
