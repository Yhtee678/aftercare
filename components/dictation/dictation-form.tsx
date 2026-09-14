"use client";
import { formatGrade } from "@/lib/ui-labels";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createDictation } from "@/app/dictation/actions";
import { Button } from "@/components/ui/button";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import { dictationFormSchema, dictationTypes, dictationTypeLabels, dictationSources, dictationSourceLabels, type DictationFormValues } from "@/lib/validation/dictation";

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";
export function DictationForm({ classes, submissionId, today, classId }: { classes: SchoolClassOption[]; submissionId: string; today: string; classId: string }) {
  const router = useRouter();
  const formId = useRef(submissionId);
  const busy = useRef(false);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<DictationFormValues>({ defaultValues: {
    schoolClassId: classId, source: "SCHOOL", type: "DICTATION", description: "", assignedDate: today, scheduledDate: today,
  } });
  const submit = async (values: DictationFormValues) => {
    clearErrors();
    const parsed = dictationFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(issue.path[0] as keyof DictationFormValues, { message: issue.message }, { shouldFocus: true });
      return;
    }
    try {
      const result = await createDictation({ ...values, submissionId: formId.current });
      if (!result.success) { setError("root", { message: result.message }); return; }
      setSaved(true);
      router.replace(`/dictation/${result.id}?created=1`);
    } catch { setError("root", { message: "暂时无法确认保存结果，请使用此表单重试。" }); }
  };
  const selects = [
    { name: "schoolClassId", label: "学校／班级", options: [{ value: "", label: "请选择已启用的班级" }, ...classes.map((item) => ({ value: item.id, label: `${item.schoolName} · ${item.academicYear} · ${formatGrade(item.grade)} · ${item.className}` }))] },
    { name: "source", label: "来源", options: dictationSources.map((value) => ({ value, label: dictationSourceLabels[value] })) },
    { name: "type", label: "类型", options: dictationTypes.map((value) => ({ value, label: dictationTypeLabels[value] })) },
  ] as const;
  return <form method="post" noValidate className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    if (busy.current || saved) return;
    busy.current = true;
    startTransition(async () => { try { await handleSubmit(submit)(event); } finally { busy.current = false; } });
  }}>
    <noscript>请启用 JavaScript 以添加听写。</noscript>
    {errors.root && <p role="alert" className="text-red-700">{errors.root.message}</p>}
    {saved && <p role="status" className="text-green-800">听写已保存并分配。</p>}
    <fieldset disabled={isSubmitting || saved} className="space-y-5 disabled:opacity-70">
      {selects.map((field) => <div key={field.name}><label htmlFor={field.name} className="text-sm font-medium">{field.label} *</label>
        <select id={field.name} {...register(field.name)} required className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`}>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>{errors[field.name] && <p id={`${field.name}-error`} role="alert" className="text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <div><label htmlFor="description" className="text-sm font-medium">内容 *</label>
        <textarea id="description" {...register("description")} required rows={3} maxLength={5000} className={inputClass} aria-invalid={!!errors.description} aria-describedby="description-error" />
        {errors.description && <p id="description-error" role="alert" className="text-sm text-red-700">{errors.description.message}</p>}
      </div>
      {(["assignedDate", "scheduledDate"] as const).map((name) => <div key={name}><label htmlFor={name} className="text-sm font-medium">{name === "assignedDate" ? "安排日期" : "听写日期"} *</label>
        <input id={name} {...register(name)} type="date" required className={inputClass} aria-invalid={!!errors[name]} aria-describedby={`${name}-error`} />
        {errors[name] && <p id={`${name}-error`} role="alert" className="text-sm text-red-700">{errors[name]?.message}</p>}
      </div>)}
      <p className="text-sm text-slate-600">保存后将分配给此班级中启用的学生。</p>
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saved ? "已保存" : isSubmitting ? "正在分配…" : "保存并分配听写"}</Button>
    </fieldset>
    <Link href={classId ? `/dictation/classes/${classId}` : "/dictation"} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">取消</Link>
  </form>;
}
