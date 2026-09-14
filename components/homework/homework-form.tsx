"use client";
import { formatGrade } from "@/lib/ui-labels";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createHomework } from "@/app/homework/actions";
import { Button } from "@/components/ui/button";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import { homeworkFormSchema, type HomeworkFormValues } from "@/lib/validation/homework";

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";
export function HomeworkForm({ classes, submissionId, today }: { classes: SchoolClassOption[]; submissionId: string; today: string }) {
  const router = useRouter();
  const saving = useRef(false);
  const formId = useRef(submissionId);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<HomeworkFormValues>({
    defaultValues: { schoolClassId: "", subject: "", description: "", taskType: "", pageFrom: "", pageTo: "", taskDate: today },
  });
  const submit = async (values: HomeworkFormValues) => {
    clearErrors();
    const parsed = homeworkFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(issue.path[0] as keyof HomeworkFormValues, { message: issue.message }, { shouldFocus: true });
      return;
    }
    try {
      const result = await createHomework({ ...values, submissionId: formId.current });
      if (!result.success) { setError("root", { message: result.message }); return; }
      setSaved(true);
      router.replace(`/homework/${result.id}?created=1`);
    } catch { setError("root", { message: "暂时无法确认保存结果，请使用此表单重试。" }); }
  };
  return <form noValidate method="post" className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    if (saving.current || saved) return;
    saving.current = true;
    startTransition(async () => { try { await handleSubmit(submit)(event); } finally { saving.current = false; } });
  }}>
    <noscript>请启用 JavaScript 以添加功课。</noscript>
    {errors.root && <p role="alert" className="text-red-700">{errors.root.message}</p>}
    {saved && <p role="status" className="text-green-800">功课已保存并分配。</p>}
    <fieldset disabled={isSubmitting || saved} className="space-y-5 disabled:opacity-70">
      <div><label htmlFor="schoolClassId" className="text-sm font-medium">学校／班级 *</label>
        <select id="schoolClassId" {...register("schoolClassId")} required className={inputClass} aria-invalid={!!errors.schoolClassId} aria-describedby="class-help class-error">
          <option value="">请选择已启用的班级</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.schoolName} · {item.academicYear} · {formatGrade(item.grade)} · {item.className}</option>)}
        </select>
        <p id="class-help" className="mt-1 text-sm text-slate-600">保存后将分配给此班级中启用的学生。</p>
        {errors.schoolClassId && <p id="class-error" role="alert" className="text-sm text-red-700">{errors.schoolClassId.message}</p>}
      </div>
      {([
        { name: "subject", label: "科目", type: "text", required: true, maxLength: 200 },
        { name: "description", label: "功课内容", type: "textarea", required: true, maxLength: 5000 },
        { name: "taskType", label: "功课类型（选填）", type: "text", required: false, maxLength: 200 },
        { name: "pageFrom", label: "起始页数（选填）", type: "number", required: false },
        { name: "pageTo", label: "结束页数（选填）", type: "number", required: false },
        { name: "taskDate", label: "功课日期", type: "date", required: true },
      ] as const).map((field) => <div key={field.name}>
        <label htmlFor={field.name} className="text-sm font-medium">{field.label}{field.required ? " *" : ""}</label>
        {field.type === "textarea"
          ? <textarea id={field.name} {...register(field.name)} rows={3} maxLength={field.maxLength} required className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`} />
          : <input id={field.name} {...register(field.name)} type={field.type} required={field.required} className={inputClass}
            maxLength={"maxLength" in field ? field.maxLength : undefined} min={field.type === "number" ? 1 : undefined} step={field.type === "number" ? 1 : undefined}
            aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`} />}
        {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saved ? "已保存" : isSubmitting ? "正在分配…" : "保存并分配功课"}</Button>
    </fieldset>
    <Link href="/homework" className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">取消</Link>
  </form>;
}
