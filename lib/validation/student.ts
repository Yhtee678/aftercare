import { z } from "./zod";

const optionalText = (max: number, label: string) => z.string()
  .trim().max(max, `${label}不能超过${max}个字。`)
  .optional().transform((value) => value || null);

export const studentFormSchema = z.object({
  name: z.string().trim().min(1, "请填写学生姓名。")
    .max(200, "学生姓名不能超过200个字。"),
  schoolClassId: z.uuid("请选择班级。"),
  parentName: optionalText(200, "家长姓名"),
  parentPhone: optionalText(50, "家长电话"),
  notes: optionalText(2000, "备注"),
});

export const createStudentSchema = studentFormSchema.extend({
  submissionId: z.uuid("表单已过期，请刷新后重试。"),
});

export type StudentFormValues = z.input<typeof studentFormSchema>;
export type CreateStudentInput = z.output<typeof createStudentSchema>;
export const editStudentSchema = studentFormSchema.extend({
  id: z.uuid("学生链接无效，请返回学生列表后重试。"),
});
export type EditStudentInput = z.output<typeof editStudentSchema>;
export const deactivateStudentSchema = editStudentSchema.pick({ id: true }).extend({
  confirmed: z.literal(true, "请先确认停用。"),
});
export type DeactivateStudentInput = z.output<typeof deactivateStudentSchema>;
export type DeactivateStudentResult =
  | { success: true; id: string }
  | { success: false; message: string };
export type StudentField = keyof StudentFormValues;
export type CreateStudentResult =
  | { success: true; id: string }
  | { success: false; message: string; fieldErrors?: Partial<Record<StudentField, string>> };
