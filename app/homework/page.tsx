import { formatGrade } from "@/lib/ui-labels";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { HomeworkLoadError } from "@/components/homework/homework-load-error";

export const metadata: Metadata = { title: "功课" };

export default async function Page() {
  await connection();
  let classes;
  try {
    const { getHomeworkClasses } = await import("@/db/queries/homework");
    classes = await getHomeworkClasses();
  } catch {
    console.error("Homework grades: class query failed.");
    return <HomeworkLoadError />;
  }
  // Keep any historical grades outside the current form's 1–6 range reachable.
  const grades = [...new Set([1, 2, 3, 4, 5, 6, ...classes.map((item) => item.grade)])].sort((a, b) => a - b);
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-semibold">功课</h1><p className="mt-2 text-sm text-slate-600">先选择年级，再选择班级。任务数量包含所有日期。</p></div>
      <Link href="/homework/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white"><Plus className="size-4" aria-hidden="true" /> 添加功课</Link>
    </div>
    <div className="space-y-3">{grades.map((grade) => {
      const items = classes.filter((item) => item.grade === grade);
      return <details key={grade} className="rounded-xl border border-slate-200 bg-white">
        <summary className="min-h-14 cursor-pointer rounded-xl px-4 py-4 font-semibold focus-visible:outline-2 focus-visible:outline-blue-700">{formatGrade(grade)} <span className="ml-2 text-sm font-normal text-slate-600">{items.length} {items.length === 1 ? "个班级" : "个班级"}</span></summary>
        {items.length ? <ul className="grid gap-3 p-4 pt-0 sm:grid-cols-2">{items.map((item) => <li key={item.id}>
          <Link href={`/homework/classes/${item.id}`} className="block space-y-2 rounded-lg border border-slate-200 p-4 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-blue-700">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words font-medium">{item.schoolName} · {item.className}</span><span className="text-sm text-slate-600">{item.taskCount} {item.taskCount === 1 ? "项任务" : "项任务"}</span></div>
            {(item.status === "INACTIVE" || item.schoolStatus === "INACTIVE") && <p className="text-sm text-slate-500">{item.status === "INACTIVE" ? "班级已停用" : "学校已停用"}</p>}
          </Link>
        </li>)}</ul> : <p className="px-4 pb-4 text-sm text-slate-600">{formatGrade(grade)}暂无班级。</p>}
      </details>;
    })}</div>
  </div>;
}
