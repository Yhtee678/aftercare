import { z } from "./zod";

export const schoolIdSchema = z.uuid("学校链接无效，请返回学校列表后重试。");
export const schoolFormSchema = z.object({
  name: z.string().trim().min(1, "请填写学校名称。").max(200, "学校名称不能超过200个字。"),
});
export const createSchoolSchema = schoolFormSchema.extend({ submissionId: schoolIdSchema });
export const editSchoolSchema = schoolFormSchema.extend({ id: schoolIdSchema });
export const deactivateSchoolSchema = z.object({
  id: schoolIdSchema,
  confirmed: z.literal(true, "请先确认停用。"),
});
export type CreateSchoolInput = z.output<typeof createSchoolSchema>;
export type EditSchoolInput = z.output<typeof editSchoolSchema>;
export type DeactivateSchoolInput = z.output<typeof deactivateSchoolSchema>;
export type SchoolMutationResult =
  | { success: true; id: string }
  | { success: false; message: string; nameError?: string };
