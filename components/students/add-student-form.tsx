"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createStudent } from "@/app/students/new/actions";
import { Button } from "@/components/ui/button";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import { studentFormSchema, type StudentFormValues, type StudentField } from "@/lib/validation/student";

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600";

export function AddStudentForm({ classes, submissionId }: { classes: SchoolClassOption[]; submissionId: string }) {
  const router = useRouter();
  const saving = useRef(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<StudentFormValues>({
    defaultValues: { name: "", schoolClassId: "", parentName: "", parentPhone: "", notes: "" },
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
      const result = await createStudent({ ...values, submissionId });
      if (!result.success) {
        setError("root", { message: result.message });
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as StudentField, { message }, { shouldFocus: true });
        }
        return;
      }
      setCreatedId(result.id);
      router.replace(`/students?created=${result.id}`);
    } catch {
      setError("root", { message: "Unable to confirm creation. Try again using this form; it will not add the same submission twice." });
    }
  };

  return (
    <form method="post" onSubmit={(event) => {
      if (createdId || saving.current) { event.preventDefault(); return; }
      saving.current = true;
      void handleSubmit(submit)(event).finally(() => { saving.current = false; });
    }} noValidate className="space-y-5">
      <noscript><p>Enable JavaScript to use the student creation form.</p></noscript>
      {errors.root && <p role="alert" className="text-sm text-red-700">{errors.root.message}</p>}
      {createdId && <p role="status" className="text-sm text-green-800">Student added successfully. <Link href={`/students?created=${createdId}`} className="underline">View students</Link></p>}
      <fieldset disabled={isSubmitting || !!createdId} className="space-y-5 disabled:opacity-70">
        <div>
          <label htmlFor="student-name" className="text-sm font-medium">Student name <span aria-hidden="true">*</span></label>
          <input id="student-name" {...register("name")} required maxLength={200} autoComplete="off" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <p id="name-error" role="alert" className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="school-class" className="text-sm font-medium">School class <span aria-hidden="true">*</span></label>
          <select id="school-class" {...register("schoolClassId")} required className={inputClass} aria-invalid={!!errors.schoolClassId} aria-describedby="class-help class-error">
            <option value="">Select a school class</option>
            {classes.map((option) => <option key={option.id} value={option.id}>{option.schoolName} · {option.academicYear} · Grade {option.grade} · {option.className}</option>)}
          </select>
          <p id="class-help" className="mt-1 text-xs leading-5 text-slate-600">School · Academic year · Grade · Class. Only active classes are available.</p>
          <p id="class-error" role={errors.schoolClassId ? "alert" : undefined} className="mt-1 text-sm text-red-700">{errors.schoolClassId?.message}</p>
        </div>
        {([
          { name: "parentName", label: "Parent name (optional)", max: 200, type: "text" },
          { name: "parentPhone", label: "Parent phone (optional)", max: 50, type: "tel" },
        ] as const).map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-medium">{field.label}</label>
            <input id={field.name} {...register(field.name)} type={field.type} maxLength={field.max} autoComplete="off" className={inputClass} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />
            {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field.name]?.message}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
          <textarea id="notes" {...register("notes")} rows={4} maxLength={2000} className={inputClass} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />
          {errors.notes && <p id="notes-error" role="alert" className="mt-1 text-sm text-red-700">{errors.notes.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting || !!createdId} className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto sm:px-6">
          {createdId ? "Student added" : isSubmitting ? "Saving…" : "Add Student"}
        </Button>
      </fieldset>
      <Link href="/students" className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">Cancel</Link>
    </form>
  );
}
