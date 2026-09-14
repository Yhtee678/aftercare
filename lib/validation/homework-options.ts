import { z } from "./zod";
import { homeworkSubjects, homeworkMaterials, resolveOption } from "../workflow-display";
export const homeworkOptionsSchema = z.object({
  subjectChoice: z.enum([...homeworkSubjects, "其他"], "请选择科目。"),
  customSubject: z.string().trim().max(200),
  typeChoice: z.enum(["", ...homeworkMaterials, "其他"]),
  customType: z.string().trim().max(200),
}).superRefine((value, ctx) => {
  if (value.subjectChoice === "其他" && !value.customSubject) ctx.addIssue({ code: "custom", path: ["customSubject"], message: "请填写其他科目。" });
  if (value.typeChoice === "其他" && !value.customType) ctx.addIssue({ code: "custom", path: ["customType"], message: "请填写其他功课类型。" });
}).transform((value) => ({ subject: resolveOption(value.subjectChoice, value.customSubject), taskType: resolveOption(value.typeChoice, value.customType) }));
