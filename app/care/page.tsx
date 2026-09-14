
import { formatGrade } from "@/lib/ui-labels";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CareLoadError } from "@/components/care/care-load-error";

export const metadata: Metadata = { title: "托育" };

export default async function Page() {
  await connection();
  let classes;
  let today;
  try {
    const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
    const { getCareToday } = await import("@/db/queries/care");
    [classes, today] = await Promise.all([getActiveSchoolClasses(), getCareToday()]);
  } catch {
    console.error("Care browsing: class/date query failed.");
    return <CareLoadError />;
  }
  const grades = [...new Set([1, 2, 3, 4, 5, 6, ...classes.map((item) => item.grade)])].sort((a, b) => a - b);
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">每日托育</h1><p className="mt-2 text-sm text-slate-600">今日 · {today} · 马来西亚时间。请选择年级与班级。</p></div>
    <div className="space-y-3">{grades.map((grade) => {
      const items = classes.filter((item) => item.grade === grade);
      return <details key={grade} className="rounded-xl border border-slate-200 bg-white">
        <summary className="min-h-14 cursor-pointer rounded-xl p-4 font-semibold focus-visible:outline-2 focus-visible:outline-blue-700">{formatGrade(grade)} <span className="ml-2 text-sm font-normal text-slate-600">{items.length} {items.length === 1 ? "个班级" : "个班级"}</span></summary>
        {items.length ? <ul className="grid gap-3 p-4 pt-0 sm:grid-cols-2">{items.map((item) => <li key={item.id}>
          <Link href={`/care/classes/${item.id}`} className="block space-y-2 rounded-lg border border-slate-200 p-4 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-blue-700">
            <span className="break-words font-medium">{item.schoolName} · {item.className}</span>
          </Link>
        </li>)}</ul> : <p className="px-4 pb-4 text-sm text-slate-600">{formatGrade(grade)}暂无启用的班级。</p>}
      </details>;
    })}</div>
  </div>;
}
