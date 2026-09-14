"use client";

import { useId, useState } from "react";
import { StudentHomeworkRow } from "@/components/homework/student-homework-row";
import { StudentDictationRow } from "@/components/dictation/student-dictation-row";
import type { HomeworkStatus } from "@/lib/validation/homework";
import type { DictationStatus } from "@/lib/validation/dictation";
import { matchesAssignment } from "@/lib/assignment-search";

type Assignment<S> = { id: string; studentName: string; status: S };
type Props = { kind: "homework"; assignments: Assignment<HomeworkStatus>[] }
  | { kind: "dictation"; assignments: Assignment<DictationStatus>[]; context: string };

export function AssignmentStudentList(props: Props) {
  const [search, setSearch] = useState("");
  const id = useId();
  // Number the full deterministic server order, never the filtered subset.
  const visible = (name: string, index: number) => matchesAssignment(name, index + 1, search);
  const count = props.assignments.filter((item, index) => visible(item.studentName, index)).length;
  if (!props.assignments.length) return <p>此任务尚未分配学生。</p>;
  return <div className="space-y-3">
    <label htmlFor={id} className="text-sm font-medium">搜索学生姓名／编号</label>
    <input id={id} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="输入姓名或编号，如 陈、12" className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-blue-700" />
    <p role="status" className="text-sm text-slate-600">显示 {count} / {props.assignments.length} 位学生</p>
    {/* Keep rows mounted while filtering so pending actions and local photo state survive. */}
    <ul className="space-y-3">{props.kind === "homework"
      ? props.assignments.map((assignment, index) => <StudentHomeworkRow key={assignment.id} assignment={assignment} number={index + 1} hidden={!visible(assignment.studentName, index)} />)
      : props.assignments.map((assignment, index) => <StudentDictationRow key={assignment.id} assignment={assignment} number={index + 1} hidden={!visible(assignment.studentName, index)} context={props.context} />)}
    </ul>
    {!count && <p className="text-sm text-slate-600">没有符合条件的学生。</p>}
  </div>;
}
