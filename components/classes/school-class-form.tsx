"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createSchoolClass, editSchoolClass } from "@/app/more/classes/actions";
import { Button } from "@/components/ui/button";
import type { ActiveSchoolOption } from "@/db/queries/schools";
import { schoolClassFormSchema, type SchoolClassFormValues, type SchoolClassField } from "@/lib/validation/school-class";

type Props = { schools: ActiveSchoolOption[]; initialValues: SchoolClassFormValues } & (
  { mode: "create"; submissionId: string } | { mode: "edit"; id: string }
);
const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";

export function SchoolClassForm(props: Props) {
  const router = useRouter();
  const saving = useRef(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { register, handleSubmit, clearErrors, setError, formState: { errors, isSubmitting } } = useForm<SchoolClassFormValues>({ defaultValues: props.initialValues });
  const submit = async (values: SchoolClassFormValues) => {
    clearErrors();
    const parsed = schoolClassFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(issue.path[0] as SchoolClassField, { message: issue.message }, { shouldFocus: true });
      return;
    }
    try {
      const result = props.mode === "create"
        ? await createSchoolClass({ ...values, submissionId: props.submissionId })
        : await editSchoolClass({ ...values, id: props.id });
      if (!result.success) {
        setError("root", { message: result.message });
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) setError(field as SchoolClassField, { message }, { shouldFocus: true });
        return;
      }
      setSavedId(result.id);
      router.replace(`/more/classes/${result.id}?${props.mode === "create" ? "created" : "updated"}=1`);
    } catch {
      setError("root", { message: "Unable to confirm the save. Please try again using this form." });
    }
  };
  return <form method="post" noValidate className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    if (saving.current || savedId) return;
    saving.current = true;
    startTransition(async () => {
      try { await handleSubmit(submit)(event); } finally { saving.current = false; }
    });
  }}>
    <noscript><p>Enable JavaScript to use the class form.</p></noscript>
    {errors.root && <p role="alert" className="text-sm text-red-700">{errors.root.message}</p>}
    {savedId && <p role="status" className="text-sm text-green-800">School class saved successfully.</p>}
    <fieldset disabled={isSubmitting || !!savedId} className="space-y-5 disabled:opacity-70">
      <div>
        <label htmlFor="schoolId" className="text-sm font-medium">School <span aria-hidden="true">*</span></label>
        <select id="schoolId" {...register("schoolId")} defaultValue={props.initialValues.schoolId} required className={inputClass} aria-invalid={!!errors.schoolId} aria-describedby="school-help school-error">
          <option value="">Select an active school</option>
          {props.schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
        </select>
        <p id="school-help" className="mt-1 text-xs text-slate-600">Only active schools are available.</p>
        <p id="school-error" role={errors.schoolId ? "alert" : undefined} className="mt-1 text-sm text-red-700">{errors.schoolId?.message}</p>
      </div>
      {([
        { name: "academicYear", label: "Academic year", type: "number", min: 1000, max: 9999 },
        { name: "grade", label: "Grade", type: "number", min: 1, max: 6 },
        { name: "className", label: "Class name", type: "text", min: undefined, max: undefined },
      ] as const).map((field) => <div key={field.name}>
        <label htmlFor={field.name} className="text-sm font-medium">{field.label} <span aria-hidden="true">*</span></label>
        <input id={field.name} {...register(field.name)} defaultValue={props.initialValues[field.name]} type={field.type} required min={field.min} max={field.max}
          step={field.type === "number" ? 1 : undefined} maxLength={field.type === "text" ? 200 : undefined} autoComplete="off" className={inputClass}
          aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />
        {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field.name]?.message}</p>}
      </div>)}
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto sm:px-6">
        {savedId ? "Saved" : isSubmitting ? "Saving…" : props.mode === "create" ? "Add School Class" : "Save changes"}
      </Button>
    </fieldset>
    <Link href={props.mode === "create" ? "/more/classes" : `/more/classes/${props.id}`} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">Cancel</Link>
  </form>;
}
