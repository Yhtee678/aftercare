"use client";
import { formatGrade } from "@/lib/ui-labels";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import { studentFormSchema, type StudentFormValues, type StudentField, type CreateStudentResult } from "@/lib/validation/student";

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";

export function StudentForm({ classes, initialValues, saveAction, successHref, cancelHref, editing = false }: {
  classes: SchoolClassOption[];
  initialValues?: StudentFormValues;
  saveAction: (values: StudentFormValues) => Promise<CreateStudentResult>;
  successHref: (id: string) => string;
  cancelHref: string;
  editing?: boolean;
}) {
  const router = useRouter();
  const saving = useRef(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<StudentFormValues>({
    defaultValues: initialValues ?? { name: "", schoolClassId: "", parentName: "", parentPhone: "", notes: "" },
  });

  const submit = async (values: StudentFormValues) => {
    clearErrors();
    try {
      const parsed = studentFormSchema.safeParse(values);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          setError(issue.path[0] as StudentField, { message: issue.message }, { shouldFocus: true });
        }
        return;
      }
      const result = await saveAction(values);
      if (!result.success) {
        setError("root", { message: result.message });
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as StudentField, { message }, { shouldFocus: true });
        }
        return;
      }
      setSavedId(result.id);
      router.replace(successHref(result.id));
    } catch {
      setError("root", { message: editing ? "暂时无法确认更新结果，请使用此表单重试。" : "暂时无法确认是否已添加，请使用此表单重试，不会重复添加。" });
    }
  };

  return (
    <form method="post" onSubmit={(event) => {
      if (savedId || saving.current) { event.preventDefault(); return; }
      saving.current = true;
      event.preventDefault();
      startTransition(async () => {
        try { await handleSubmit(submit)(event); } finally { saving.current = false; }
      });
    }} noValidate className="space-y-5">
      <noscript><p>请启用 JavaScript 以填写学生资料。</p></noscript>
      {errors.root && <p role="alert" className="text-sm text-red-700">{errors.root.message}</p>}
      {savedId && <p role="status" className="text-sm text-green-800">{editing ? "学生资料已更新。" : "学生已添加。"} <Link href={successHref(savedId)} className="underline">{editing ? "查看学生" : "查看学生"}</Link></p>}
      <fieldset disabled={isSubmitting || !!savedId} className="space-y-5 disabled:opacity-70">
        <div>
          <label htmlFor="student-name" className="text-sm font-medium">学生姓名 <span aria-hidden="true">*</span></label>
          <input id="student-name" defaultValue={initialValues?.name} {...register("name")} required maxLength={200} autoComplete="off" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <p id="name-error" role="alert" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="school-class" className="text-sm font-medium">班级 <span aria-hidden="true">*</span></label>
          <select id="school-class" defaultValue={initialValues?.schoolClassId ?? ""} {...register("schoolClassId")} required className={inputClass} aria-invalid={!!errors.schoolClassId} aria-describedby="class-help class-error">
            <option value="">请选择班级</option>
            {classes.map((option) => <option key={option.id} value={option.id}>{option.schoolName} · {option.academicYear} · {formatGrade(option.grade)} · {option.className}</option>)}
          </select>
          <p id="class-help" className="mt-1 text-xs leading-5 text-slate-600">学校 · 学年 · 年级 · 班级。仅显示已启用的班级。</p>
          <p id="class-error" role={errors.schoolClassId ? "alert" : undefined} className="mt-1 text-sm text-red-700">{errors.schoolClassId?.message}</p>
        </div>
        {([
          { name: "parentName", label: "家长姓名（选填）", max: 200, type: "text" },
          { name: "parentPhone", label: "家长电话（选填）", max: 50, type: "tel" },
        ] as const).map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-medium">{field.label}</label>
            <input id={field.name} defaultValue={initialValues?.[field.name]} {...register(field.name)} type={field.type} maxLength={field.max} autoComplete="off" className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />
            {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field.name]?.message}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="notes" className="text-sm font-medium">备注（选填）</label>
          <textarea id="notes" defaultValue={initialValues?.notes} {...register("notes")} rows={4} maxLength={2000} className={inputClass} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />
          {errors.notes && <p id="notes-error" role="alert" className="mt-1 text-sm text-red-700">{errors.notes.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting || !!savedId} className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto sm:px-6">
          {savedId ? "已保存" : isSubmitting ? "正在保存…" : editing ? "保存更改" : "添加学生"}
        </Button>
      </fieldset>
      <Link href={cancelHref} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">取消</Link>
    </form>
  );
}
