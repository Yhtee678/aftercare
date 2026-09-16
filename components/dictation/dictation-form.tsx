"use client";
import { DictationContent } from "./dictation-content";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createDictation } from "@/app/dictation/actions";
import { Button } from "@/components/ui/button";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import { TaskStudentSelector } from "@/components/students/task-student-selector";
import type { AssignmentStudent } from "@/lib/assignment-selection";
import { dictationFormSchema, dictationTypes, dictationTypeLabels, dictationSources, dictationSourceLabels, type DictationFormValues } from "@/lib/validation/dictation";

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";
export function DictationForm({ classes, students, submissionId, today, classId }: { classes: SchoolClassOption[]; students: AssignmentStudent[]; submissionId: string; today: string; classId: string }) {
  const router = useRouter();
  const formId = useRef(submissionId);
  const busy = useRef(false);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setValue, setError, clearErrors, control, formState: { errors, isSubmitting } } = useForm<DictationFormValues>({ defaultValues: {
    contentFormat: "NUMBERED", schoolClassId: classId, studentIds: [], source: "SCHOOL", type: "DICTATION", description: "", assignedDate: today, scheduledDate: today,
  } });
  const [description, contentFormat, selectedClass, studentIds] = useWatch({ control, name: ["description", "contentFormat", "schoolClassId", "studentIds"] });
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
      <TaskStudentSelector classes={classes} students={students} classId={selectedClass} onClassChange={(id) => setValue("schoolClassId", id)} selected={studentIds} onSelectedChange={(ids) => setValue("studentIds", ids)} />
      {(errors.schoolClassId || errors.studentIds) && <p role="alert" className="text-red-700">{errors.schoolClassId?.message || errors.studentIds?.message}</p>}
      {selects.map((field) => <div key={field.name}><label htmlFor={field.name} className="text-sm font-medium">{field.label} *</label>
        <select id={field.name} {...register(field.name)} required className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`}>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>{errors[field.name] && <p id={`${field.name}-error`} role="alert" className="text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <div><label htmlFor="contentFormat">内容模式</label><select id="contentFormat" {...register("contentFormat")} className={inputClass}><option value="NUMBERED">编号模式（每行一项）</option><option value="PLAIN">纯文字模式</option></select></div>
      <div><label htmlFor="description" className="text-sm font-medium">内容 *</label>
        <textarea id="description" {...register("description")} required rows={3} maxLength={5000} className={inputClass} aria-invalid={!!errors.description} aria-describedby="description-error" />
        {errors.description && <p id="description-error" role="alert" className="text-sm text-red-700">{errors.description.message}</p>}
      </div>
      <div className="rounded-lg border p-3"><p className="mb-2 text-sm text-slate-600">内容预览</p><DictationContent text={description} format={contentFormat} /></div>
      {(["assignedDate", "scheduledDate"] as const).map((name) => <div key={name}><label htmlFor={name} className="text-sm font-medium">{name === "assignedDate" ? "安排日期" : "听写日期"} *</label>
        <input id={name} {...register(name)} type="date" required className={inputClass} aria-invalid={!!errors[name]} aria-describedby={`${name}-error`} />
        {errors[name] && <p id={`${name}-error`} role="alert" className="text-sm text-red-700">{errors[name]?.message}</p>}
      </div>)}
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saved ? "已保存" : isSubmitting ? "正在分配…" : "保存并分配听写"}</Button>
    </fieldset>
    <Link href={classId ? `/dictation/classes/${classId}` : "/dictation"} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">取消</Link>
  </form>;
}
