"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { completionState, completionStyles, completionLabels, type DailyProgress } from "@/lib/workflow-display";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeCareAction } from "@/app/care/actions";
import { formatCareTime } from "@/lib/care-date";
import type { CareAction, CareState } from "@/lib/validation/care";
import { optimisticCare } from "@/lib/care-optimistic";

type Student = {
  studentId: string; name: string; arrivalTime: string | null;
  mealCompleted: boolean | null; showerCompleted: boolean | null;
  bagChecked: boolean | null; finalCheckCompleted: boolean | null;
};
const checks = [
  { action: "mealCompleted", label: "吃饭" }, { action: "showerCompleted", label: "冲凉" },
  { action: "bagChecked", label: "检查书包" }, { action: "finalCheckCompleted", label: "最终检查" },
] as const;

export function CareStudentRow({ student, schoolClassId, recordDate, readOnly, originalClass }: {
  student: Student & DailyProgress & CareState; schoolClassId: string; recordDate: string; readOnly: boolean; originalClass: string | null;
}) {
  const [confirmed, setConfirmed] = useState(student);
  const [source, setSource] = useState(student);
  // A refresh/navigation supplies a fresh database snapshot, including other teachers' work.
  if (source !== student) { setSource(student); setConfirmed(student); }
  const [view, setOptimistic] = useOptimistic(confirmed);
  const state = completionState(view);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const record = (action: CareAction) => {
    if (busy.current || readOnly) return;
    busy.current = true;
    startTransition(async () => {
      setOptimistic(optimisticCare(confirmed, action, new Date().toISOString()));
      try {
        const result = await completeCareAction({ studentId: student.studentId, schoolClassId, recordDate, action });
        if (result.success) setConfirmed({ ...confirmed, ...result.state });
        setFeedback(result.success ? { error: false, text: "已保存。" } : { error: true, text: result.message });
      } catch { setFeedback({ error: true, text: "暂时无法确认更新结果，请重试或刷新查看状态。" }); }
      finally { busy.current = false; }
    });
  };
  return <li className={`space-y-3 rounded-xl border p-4 ${completionStyles[state]}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="break-words font-semibold"><Link href={`/students/${student.studentId}`} className="underline">{student.name}</Link></h2><span className="text-sm font-medium">{completionLabels[state]}</span>
      <p className="text-sm text-slate-600">{view.arrivalTime ? <>已到班 <time dateTime={view.arrivalTime}>{formatCareTime(view.arrivalTime)}</time></> : "未到班"}</p>
    </div>
    {originalClass && <p className="text-xs text-slate-600">本日首次记录班级： {originalClass}。原班级信息已保留。</p>}
    <p className="text-sm text-slate-600">功课 {view.homeworkCompleted}/{view.homeworkTotal} · 听写 {view.dictationCompleted}/{view.dictationTotal}{view.corrections > 0 && ` · ${view.corrections} 项功课需要订正`}</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label={`托育检查： ${student.name}`}>
      <Button variant="outline" disabled={pending || readOnly || !!view.arrivalTime} onClick={() => record("arrival")}
        aria-label={`记录到班： ${student.name}`} aria-pressed={!!view.arrivalTime}
        className={`col-span-2 min-h-12 sm:col-span-1 disabled:opacity-100 ${view.arrivalTime ? "border-green-200 bg-green-50 text-green-800" : "border-blue-300 text-blue-700"}`}>
        {view.arrivalTime ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {view.arrivalTime ? "已到班" : "记录到班"}
      </Button>
      {checks.map(({ action, label }) => <Button key={action} variant="outline" onClick={() => record(action)}
        disabled={pending || readOnly || !view.arrivalTime || !!view[action]}
        aria-label={`标记 ${label} 已完成： ${student.name}`} aria-pressed={!!view[action]}
        className={`min-h-12 ${view[action] ? "border-green-200 bg-green-50 text-green-800 disabled:opacity-100" : "text-slate-600"}`}>
        {view[action] ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />} {label}
      </Button>)}
    </div>
    {pending ? <p role="status" className="text-xs text-slate-600">正在保存…</p>
      : feedback && <p role={feedback.error ? "alert" : "status"} className={`text-xs ${feedback.error ? "text-red-700" : "text-slate-600"}`}>{feedback.text}</p>}
  </li>;
}
