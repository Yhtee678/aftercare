

export function HomeworkSummary({ task }: { task: {
  subject: string; description: string; taskDate: string; pageFrom: number | null; pageTo: number | null;
  schoolName: string | null; className: string | null; academicYear: number | null; grade: number | null; taskType?: string | null;
} }) {
  return <div className="space-y-2">
    <p className="break-words text-sm text-slate-600">{task.schoolName ? `${task.schoolName} · ${task.className}` : "个人功课"}</p>
    <h2 className="break-words text-lg font-semibold">{task.subject}</h2>
    {task.taskType && <p className="text-sm text-slate-600">{task.taskType}</p>}
    <p className="whitespace-pre-wrap break-words">{task.description}</p>
    <p className="text-sm text-slate-600"><time dateTime={task.taskDate}>{task.taskDate}</time>{task.pageFrom !== null && ` · 页数 ${task.pageFrom}${task.pageTo !== null && task.pageTo !== task.pageFrom ? `–${task.pageTo}` : ""}`}</p>
  </div>;
}
