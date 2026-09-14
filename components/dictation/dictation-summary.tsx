
import { formatGrade } from "@/lib/ui-labels";
import { dictationSourceLabels, dictationTypeLabels } from "@/lib/validation/dictation";
import { dictationDueLabel } from "@/lib/dictation-due";

export function DictationSummary({ task, today, unresolved }: { task: {
  source: keyof typeof dictationSourceLabels; type: keyof typeof dictationTypeLabels; description: string;
  assignedDate: string; scheduledDate: string; schoolName: string | null; className: string | null; grade: number | null; academicYear: number | null;
}; today: string; unresolved: boolean }) {
  return <div className="space-y-2">
    <p className="break-words text-sm text-slate-600">{task.schoolName ? `${task.schoolName} · ${task.academicYear} · ${formatGrade(task.grade)} · ${task.className}` : "个人听写"}</p>
    <h2 className="font-semibold">{dictationSourceLabels[task.source]} · {dictationTypeLabels[task.type]}</h2>
    <p className="whitespace-pre-wrap break-words">{task.description}</p>
    <p className="text-sm text-slate-600">安排日期 {task.assignedDate} · 听写日期 {task.scheduledDate}</p>
    <p className={`text-sm font-medium ${unresolved && task.scheduledDate <= today ? "text-red-800" : unresolved ? "text-amber-900" : "text-slate-600"}`}>{dictationDueLabel(task.scheduledDate, today, unresolved)}</p>
  </div>;
}
