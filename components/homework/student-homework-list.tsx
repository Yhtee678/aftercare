"use client";
import { useState } from "react";
import Link from "next/link";
import type { StudentHomeworkItem } from "@/db/queries/student-work";
import { homeworkTitle } from "@/lib/homework-title";
import { matchesAssignment } from "@/lib/assignment-search";
import { StudentHomeworkRow } from "./student-homework-row";
export function StudentHomeworkList({ students }: { students: { id: string; name: string; homework: StudentHomeworkItem[] }[] }) {
  const [search, setSearch] = useState("");
  const matches = (name: string, index: number) => matchesAssignment(name, index + 1, search);
  return <div className="space-y-4"><label htmlFor="homework-student-search" className="text-sm font-medium">搜索学生姓名／编号</label><input id="homework-student-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} className="min-h-12 w-full rounded-lg border bg-white px-3" placeholder="姓名或编号" />
    {students.map((student, index) => { const completed = student.homework.filter(h=>h.status === "COMPLETED").length; return <section hidden={!matches(student.name,index)} key={student.id} className={`space-y-3 rounded-xl border p-4 ${student.homework.some(h=>h.status === "CORRECTION_REQUIRED") ? "border-amber-300 bg-amber-50" : student.homework.length && completed === student.homework.length ? "border-green-200 bg-green-50" : "bg-white"}`}><h2 className="text-lg font-semibold">{index+1}. {student.name}</h2><p className="text-sm">{completed} / {student.homework.length} 已完成</p><ul className="space-y-3">{student.homework.map((item, number)=><StudentHomeworkRow key={item.id} number={number+1} assignment={{ id:item.id, studentName:student.name, status:item.status }} label={homeworkTitle(item.subject,item.taskType)} detail={<><p className="whitespace-pre-wrap text-sm">{item.description}{item.pageFrom !== null && ` · 页数 ${item.pageFrom}${item.pageTo !== null ? `–${item.pageTo}` : ""}`}</p><Link href={`/homework/${item.taskId}`} className="inline-flex min-h-10 items-center text-sm text-blue-700 underline">{item.taskDate} · 查看功课</Link></>} />)}</ul>{!student.homework.length && <p className="text-sm text-slate-600">今日暂无功课，也没有过往未完成功课。</p>}</section>; })}
    {!students.some((s,i)=>matches(s.name,i)) && <p role="status">没有符合条件的学生。</p>}
  </div>;
}
