"use client";

import { useState } from "react";
import { classesForGrade, selectVisible, studentsForClass, type AssignmentClass, type AssignmentStudent } from "@/lib/assignment-selection";

export function TaskStudentSelector({ classes, students, classId, onClassChange, selected, onSelectedChange, excluded = [] }: {
  classes: AssignmentClass[]; students: AssignmentStudent[]; classId: string;
  onClassChange: (id: string) => void; selected: string[]; onSelectedChange: (ids: string[]) => void; excluded?: string[];
}) {
  const initial = classes.find((item) => item.id === classId);
  const [grade, setGrade] = useState<number | null>(initial?.grade ?? null);
  const [search, setSearch] = useState("");
  const options = classesForGrade(classes, grade);
  const visible = studentsForClass(students, classId, search);
  const available = visible.filter((item) => !excluded.includes(item.id));
  const allSelected = available.length > 0 && available.every((item) => selected.includes(item.id));
  return <div className="space-y-4 rounded-lg border p-4">
    <div><label htmlFor="task-grade" className="text-sm font-medium">年级 *</label>
      <select id="task-grade" value={grade ?? ""} onChange={(event) => { setGrade(event.target.value ? Number(event.target.value) : null); onClassChange(""); onSelectedChange([]); setSearch(""); }} className="mt-2 min-h-12 w-full rounded-lg border px-3">
        <option value="">请选择年级</option>{[...new Set(classes.map((item) => item.grade))].sort((a, b) => a - b).map((value) => <option key={value} value={value}>Year {value}</option>)}
      </select></div>
    <div><label htmlFor="task-class" className="text-sm font-medium">班级 *</label>
      <select id="task-class" value={classId} disabled={grade === null} onChange={(event) => { onClassChange(event.target.value); onSelectedChange([]); setSearch(""); }} className="mt-2 min-h-12 w-full rounded-lg border px-3">
        <option value="">请选择班级</option>{options.map((item) => <option key={item.id} value={item.id}>{item.schoolName} · {item.className} · {item.academicYear}</option>)}
      </select></div>
    {classId && <><div><label htmlFor="task-student-search" className="text-sm font-medium">搜索学生姓名或编号</label>
      <input id="task-student-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></div>
      <label className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={allSelected} disabled={!available.length} onChange={() => onSelectedChange(allSelected ? selected.filter((id) => !available.some((item) => item.id === id)) : selectVisible(selected, available))} />选择当前搜索结果中的所有学生</label>
      <p className="text-sm text-slate-600">已选择 {selected.length} 位 · 显示 {visible.length} 位</p>
      <div className="max-h-72 space-y-1 overflow-y-auto">{visible.map((item) => <label key={item.id} className="flex min-h-12 items-center gap-3 rounded border px-3">
        <input type="checkbox" checked={selected.includes(item.id) || excluded.includes(item.id)} disabled={excluded.includes(item.id)} onChange={() => onSelectedChange(selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id])} />
        <span>{item.name} <span className="text-xs text-slate-500">{item.id.slice(0, 8)}</span></span>{excluded.includes(item.id) && <span className="ml-auto text-xs">已分配</span>}
      </label>)}{!visible.length && <p className="text-sm text-slate-600">没有符合条件的学生。</p>}</div></>}
  </div>;
}
