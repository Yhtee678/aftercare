"use client";

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
    } catch { setError("root", { message: "Unable to confirm the save. Retry using this form." }); }
  };
  const selects = [
    { name: "schoolClassId", label: "School / Class", options: [{ value: "", label: "Select an active class" }, ...classes.map((item) => ({ value: item.id, label: `${item.schoolName} · ${item.academicYear} · Grade ${item.grade} · ${item.className}` }))] },
    { name: "source", label: "Source", options: dictationSources.map((value) => ({ value, label: dictationSourceLabels[value] })) },
    { name: "type", label: "Type", options: dictationTypes.map((value) => ({ value, label: dictationTypeLabels[value] })) },
  ] as const;
  return <form method="post" noValidate className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    if (busy.current || saved) return;
    busy.current = true;
    startTransition(async () => { try { await handleSubmit(submit)(event); } finally { busy.current = false; } });
  }}>
    <noscript>Enable JavaScript to add dictation.</noscript>
    {errors.root && <p role="alert" className="text-red-700">{errors.root.message}</p>}
    {saved && <p role="status" className="text-green-800">Dictation saved and assigned.</p>}
    <fieldset disabled={isSubmitting || saved} className="space-y-5 disabled:opacity-70">
      {selects.map((field) => <div key={field.name}><label htmlFor={field.name} className="text-sm font-medium">{field.label} *</label>
        <select id={field.name} {...register(field.name)} required className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={`${field.name}-error`}>
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>{errors[field.name] && <p id={`${field.name}-error`} role="alert" className="text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <div><label htmlFor="description" className="text-sm font-medium">Description *</label>
        <textarea id="description" {...register("description")} required rows={3} maxLength={5000} className={inputClass} aria-invalid={!!errors.description} aria-describedby="description-error" />
        {errors.description && <p id="description-error" role="alert" className="text-sm text-red-700">{errors.description.message}</p>}
      </div>
      {(["assignedDate", "scheduledDate"] as const).map((name) => <div key={name}><label htmlFor={name} className="text-sm font-medium">{name === "assignedDate" ? "Assigned date" : "Scheduled date"} *</label>
        <input id={name} {...register(name)} type="date" required className={inputClass} aria-invalid={!!errors[name]} aria-describedby={`${name}-error`} />
        {errors[name] && <p id={`${name}-error`} role="alert" className="text-sm text-red-700">{errors[name]?.message}</p>}
      </div>)}
      <p className="text-sm text-slate-600">Assigned to active students in this class when saved.</p>
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saved ? "Saved" : isSubmitting ? "Assigning…" : "Save and assign Dictation"}</Button>
    </fieldset>
    <Link href={classId ? `/dictation/classes/${classId}` : "/dictation"} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">Cancel</Link>
  </form>;
}
