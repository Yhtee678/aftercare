import { z } from "./zod";
import { schoolIdSchema } from "./school";

const wholeNumber = (min: number, max: number, message: string) => z.union([
  z.number(), z.string().trim().regex(/^\d+$/, message).transform(Number),
]).pipe(z.number().int(message).min(min, message).max(max, message));

export const schoolClassIdSchema = z.uuid("班级链接无效，请返回班级列表后重试。");
export const schoolClassFormSchema = z.object({
  schoolId: schoolIdSchema,
  academicYear: wholeNumber(1000, 9999, "请填写四位数的学年。"),
  grade: wholeNumber(1, 6, "请填写1至6年级。"),
  className: z.string().trim().min(1, "请填写班级名称。").max(200, "班级名称不能超过200个字。"),
});
export const createSchoolClassSchema = schoolClassFormSchema.extend({ submissionId: schoolClassIdSchema });
export const editSchoolClassSchema = schoolClassFormSchema.extend({ id: schoolClassIdSchema });
export const deactivateSchoolClassSchema = z.object({ id: schoolClassIdSchema, confirmed: z.literal(true, "请先确认停用。") });
export type SchoolClassFormValues = z.input<typeof schoolClassFormSchema>;
export type SchoolClassField = keyof SchoolClassFormValues;
export type CreateSchoolClassInput = z.output<typeof createSchoolClassSchema>;
export type EditSchoolClassInput = z.output<typeof editSchoolClassSchema>;
export type DeactivateSchoolClassInput = z.output<typeof deactivateSchoolClassSchema>;
export type SchoolClassMutationResult =
  | { success: true; id: string }
  | { success: false; message: string; fieldErrors?: Partial<Record<SchoolClassField, string>> };
