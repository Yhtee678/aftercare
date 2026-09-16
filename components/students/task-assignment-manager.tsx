"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addHomeworkStudents, removeHomeworkStudent } from "@/app/homework/actions";
import { addDictationStudents, removeDictationStudent } from "@/app/dictation/actions";
import { TaskStudentSelector } from "./task-student-selector";
import type { AssignmentClass, AssignmentStudent } from "@/lib/assignment-selection";

export function TaskAssignmentManager({ kind, taskId, initialClassId, classes, students, assignments }: {
  kind: "homework" | "dictation"; taskId: string; initialClassId: string; classes: AssignmentClass[]; students: AssignmentStudent[];
  assignments: { id: string; studentId: string; studentName: string; status: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(initialClassId);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const add = () => start(async () => {
    const result = kind === "homework" ? await addHomeworkStudents({ taskId, schoolClassId: classId, studentIds: selected }) : await addDictationStudents({ taskId, schoolClassId: classId, studentIds: selected });
    if (!result.success) { setMessage(result.message); return; }
    setSelected([]); setOpen(false); setMessage("学生已添加。"); router.refresh();
  });
  const remove = (assignmentId: string, confirmProgress: boolean) => start(async () => {
    const result = kind === "homework" ? await removeHomeworkStudent({ assignmentId, confirmProgress }) : await removeDictationStudent({ assignmentId, confirmProgress });
    if (!result.success) { setMessage(result.message); if (result.requiresConfirmation) setConfirmId(assignmentId); return; }
    setConfirmId(null); setMessage("学生已移除。"); router.refresh();
  });
  return <section className="space-y-3 rounded-lg border p-4" aria-label="管理任务学生">
    <button type="button" onClick={() => setOpen(!open)} className="min-h-12 rounded-lg bg-blue-700 px-4 text-white">+ 添加学生</button>
    {message && <p role="status" className="text-sm">{message}</p>}
    {open && <div className="space-y-3"><TaskStudentSelector classes={classes} students={students} classId={classId} onClassChange={setClassId} selected={selected} onSelectedChange={setSelected} excluded={assignments.map((item) => item.studentId)} />
      <button type="button" disabled={pending || !selected.length} onClick={add} className="min-h-12 rounded-lg bg-blue-700 px-4 text-white disabled:opacity-50">添加 {selected.length} 位学生</button></div>}
    <ul className="space-y-2">{assignments.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2">
      <span>{item.studentName} <span className="text-xs text-slate-500">{item.studentId.slice(0, 8)}</span> · {item.status}</span>
      {confirmId === item.id ? <span className="flex gap-2"><button type="button" disabled={pending} onClick={() => remove(item.id, true)} className="min-h-12 rounded-lg bg-red-700 px-3 text-white">确认删除进度</button><button type="button" onClick={() => setConfirmId(null)} className="min-h-12 px-3">取消</button></span>
        : <button type="button" disabled={pending} onClick={() => remove(item.id, false)} className="min-h-12 rounded-lg border px-3 text-red-700">移除</button>}
    </li>)}</ul>
  </section>;
}
