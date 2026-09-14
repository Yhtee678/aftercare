"use client";
import { useState } from "react";
import Link from "next/link";
import { matchesStudent } from "@/lib/workflow-display";
export function StudentList({ students }: { students: { id: string; name: string; schoolName: string; className: string; status: string }[] }) {
  const [search, setSearch] = useState("");
  const visible = students.filter((student) => matchesStudent(student, search));
  return <section className="space-y-3"><label htmlFor="student-search" className="font-medium">搜索学生、学校或班级</label><input id="student-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="姓名、学校、1B…" className="min-h-12 w-full rounded-lg border bg-white px-3" /><p role="status" className="text-sm text-slate-600">共 {visible.length} 位学生</p><ol className="grid gap-3 sm:grid-cols-2">{visible.map((student, index) => <li key={student.id}><Link href={`/students/${student.id}`} className="block space-y-2 rounded-xl border bg-white p-4 hover:border-blue-400"><p className="font-semibold">{index + 1}. {student.name}</p><p className="text-sm">{student.schoolName} · {student.className}</p><p className="text-sm text-slate-600">{student.status === "ACTIVE" ? "启用中" : "已停用"}</p></Link></li>)}</ol>{!visible.length && <p>没有符合条件的学生。</p>}</section>;
}
