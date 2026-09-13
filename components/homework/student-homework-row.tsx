"use client";

import { useRef, useState, useTransition } from "react";
import { changeHomeworkStatus } from "@/app/homework/actions";
import { Button } from "@/components/ui/button";
import type { HomeworkStatus } from "@/lib/validation/homework";

export function StudentHomeworkRow({ assignment }: { assignment: { id: string; studentName: string; status: HomeworkStatus } }) {
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const completed = assignment.status === "COMPLETED";
  const correction = assignment.status === "CORRECTION_REQUIRED";
  const change = (status: "COMPLETED" | "CORRECTION_REQUIRED") => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = await changeHomeworkStatus({ id: assignment.id, status });
        setMessage(result.success ? { error: false, text: status === "COMPLETED" ? "Marked completed." : "Correction required saved." } : { error: true, text: result.message });
      } catch { setMessage({ error: true, text: "Unable to confirm the update. Refresh to check its status." }); }
      finally { busy.current = false; }
    });
  };
  return <li className={`space-y-3 rounded-xl border p-4 ${completed ? "border-slate-200 bg-slate-50 text-slate-600" : correction ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-medium">{assignment.studentName}</h3>
      <span className={`text-sm font-medium ${correction ? "text-amber-900" : completed ? "text-green-800" : "text-slate-600"}`}>{completed ? "Completed" : correction ? "Correction Required" : "Pending"}</span>
    </div>
    {!completed && <div className="flex flex-wrap gap-2">
      <Button disabled={pending} onClick={() => change("COMPLETED")} className="min-h-12 bg-blue-700 px-5 text-white hover:bg-blue-800">{pending ? "Saving…" : "Complete"}</Button>
      {!correction && <Button disabled={pending} onClick={() => change("CORRECTION_REQUIRED")} variant="outline" className="min-h-12 border-amber-400 text-amber-900">Correction Required</Button>}
    </div>}
    {message && <p role={message.error ? "alert" : "status"} className={`text-sm ${message.error ? "text-red-700" : "text-slate-600"}`}>{message.text}</p>}
  </li>;
}
