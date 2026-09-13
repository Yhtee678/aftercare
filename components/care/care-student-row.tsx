"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeCareAction } from "@/app/care/actions";
import { formatCareTime } from "@/lib/care-date";
import type { CareAction } from "@/lib/validation/care";

type Student = {
  studentId: string; name: string; arrivalTime: string | null;
  mealCompleted: boolean | null; showerCompleted: boolean | null;
  bagChecked: boolean | null; finalCheckCompleted: boolean | null;
};
const checks = [
  { action: "mealCompleted", label: "Meal" }, { action: "showerCompleted", label: "Shower" },
  { action: "bagChecked", label: "Bag Check" }, { action: "finalCheckCompleted", label: "Final Check" },
] as const;

export function CareStudentRow({ student, schoolClassId, recordDate, readOnly, originalClass }: {
  student: Student; schoolClassId: string; recordDate: string; readOnly: boolean; originalClass: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const record = (action: CareAction) => {
    if (busy.current || readOnly) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = await completeCareAction({ studentId: student.studentId, schoolClassId, recordDate, action });
        setFeedback(result.success ? { error: false, text: "Saved." } : { error: true, text: result.message });
      } catch { setFeedback({ error: true, text: "Unable to confirm the update. Retry or refresh to check its state." }); }
      finally { busy.current = false; }
    });
  };
  return <li className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="break-words font-semibold">{student.name}</h2>
      <p className="text-sm text-slate-600">{student.arrivalTime ? <>Arrived <time dateTime={student.arrivalTime}>{formatCareTime(student.arrivalTime)}</time></> : "Not arrived"}</p>
    </div>
    {originalClass && <p className="text-xs text-slate-600">Day started in {originalClass}. Original class context is preserved.</p>}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label={`Care checklist for ${student.name}`}>
      <Button variant="outline" disabled={pending || readOnly || !!student.arrivalTime} onClick={() => record("arrival")}
        aria-label={`Record arrival for ${student.name}`} aria-pressed={!!student.arrivalTime}
        className={`col-span-2 min-h-12 sm:col-span-1 disabled:opacity-100 ${student.arrivalTime ? "border-green-200 bg-green-50 text-green-800" : "border-blue-300 text-blue-700"}`}>
        {student.arrivalTime ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {student.arrivalTime ? "Arrived" : "Arrive"}
      </Button>
      {checks.map(({ action, label }) => <Button key={action} variant="outline" onClick={() => record(action)}
        disabled={pending || readOnly || !student.arrivalTime || !!student[action]}
        aria-label={`Mark ${label} completed for ${student.name}`} aria-pressed={!!student[action]}
        className={`min-h-12 ${student[action] ? "border-green-200 bg-green-50 text-green-800 disabled:opacity-100" : "text-slate-600"}`}>
        {student[action] ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {label}
      </Button>)}
    </div>
    {pending ? <p role="status" className="text-xs text-slate-600">Saving…</p>
      : feedback && <p role={feedback.error ? "alert" : "status"} className={`text-xs ${feedback.error ? "text-red-700" : "text-slate-600"}`}>{feedback.text}</p>}
  </li>;
}
