"use client";

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
    } catch { setError("root", { message: "Unable to confirm the save. Retry using this form." }); }
  };
  return <form noValidate method="post" className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    if (saving.current || saved) return;
    saving.current = true;
    startTransition(async () => { try { await handleSubmit(submit)(event); } finally { saving.current = false; } });
  }}>
    <noscript>Enable JavaScript to add homework.</noscript>
    {errors.root && <p role="alert" className="text-red-700">{errors.root.message}</p>}
    {saved && <p role="status" className="text-green-800">Homework saved and assigned.</p>}
    <fieldset disabled={isSubmitting || saved} className="space-y-5 disabled:opacity-70">
      <div><label htmlFor="schoolClassId" className="text-sm font-medium">School / Class *</label>
        <select id="schoolClassId" {...register("schoolClassId")} required className={inputClass} aria-invalid={!!errors.schoolClassId} aria-describedby="class-help class-error">
          <option value="">Select an active class</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.schoolName} · {item.academicYear} · Grade {item.grade} · {item.className}</option>)}
        </select>
        <p id="class-help" className="mt-1 text-sm text-slate-600">Assigned to active students in this class when saved.</p>
        {errors.schoolClassId && <p id="class-error" role="alert" className="text-sm text-red-700">{errors.schoolClassId.message}</p>}
      </div>
      {([
        { name: "subject", label: "Subject", type: "text", required: true, maxLength: 200 },
        { name: "description", label: "Description", type: "textarea", required: true, maxLength: 5000 },
        { name: "taskType", label: "Task type (optional)", type: "text", required: false, maxLength: 200 },
        { name: "pageFrom", label: "Page from (optional)", type: "number", required: false },
        { name: "pageTo", label: "Page to (optional)", type: "number", required: false },
        { name: "taskDate", label: "Task date", type: "date", required: true },
      ] as const).map((field) => <div key={field.name}>
        <label htmlFor={field.name} className="text-sm font-medium">{field.label}{field.required ? " *" : ""}</label>
        {field.type === "textarea"
          ? <textarea id={field.name} {...register(field.name)} rows={3} maxLength={field.maxLength} required className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`} />
          : <input id={field.name} {...register(field.name)} type={field.type} required={field.required} className={inputClass}
            maxLength={"maxLength" in field ? field.maxLength : undefined} min={field.type === "number" ? 1 : undefined} step={field.type === "number" ? 1 : undefined}
            aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`} />}
        {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saved ? "Saved" : isSubmitting ? "Assigning…" : "Save and assign Homework"}</Button>
    </fieldset>
    <Link href="/homework" className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">Cancel</Link>
  </form>;
}
