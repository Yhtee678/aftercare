import Link from "next/link";
import { connection } from "next/server";
import { formatGrade } from "@/lib/ui-labels";
import { gradeSummaries } from "@/lib/workflow-display";
export const metadata = { title: "今日" };
export default async function Page() {
  await connection();
  let data;
  try { const { getTodayOverview } = await import("@/db/queries/today"); data = await getTodayOverview(); }
  catch { return <div><h1 className="text-2xl font-semibold">今日</h1><p role="alert">暂时无法加载今日事项，请刷新重试。</p></div>; }
  const attention = [...data.dueDictations, ...data.corrections, ...data.nextDictations, ...data.bags];
  const grades = gradeSummaries(data.classes, attention);
  return <div className="space-y-6"><header><h1 className="text-2xl font-semibold">今日</h1><p className="mt-2 text-sm text-slate-600">{data.today} · 马来西亚时间</p></header>
    <div className="grid grid-cols-3 gap-2">{[["总学生", data.classes.reduce((sum, item) => sum + item.activeStudents, 0)], ["已到班", data.classes.reduce((sum, item) => sum + item.arrived, 0)], ["需要注意", attention.length]].map(([label, count]) => <div key={label} className="rounded-xl border bg-white p-3"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-semibold">{count}</p></div>)}</div>
    <p className={attention.length ? "rounded-lg bg-amber-50 p-3 text-amber-900" : "rounded-lg bg-green-50 p-3 text-green-800"}>{attention.length ? "请打开有注意事项的年级，优先处理听写、订正及书包检查。" : "目前没有需要处理的事项。"}</p>
    <div className="grid gap-3 sm:grid-cols-2">{grades.map((grade) => <Link key={grade.grade} prefetch={false} href={`/today/grades/${grade.grade}`} className={`space-y-2 rounded-xl border p-4 ${grade.attention ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}><h2 className="text-lg font-semibold">{formatGrade(grade.grade)}</h2><p>{grade.students} 位学生 · 已到班 {grade.arrived}</p><p className={grade.attention ? "font-medium text-red-800" : "text-slate-600"}>需要注意 {grade.attention} 项</p><p className="text-sm text-slate-600">已检查书包 {grade.bags}{grade.homeworkTotal > 0 && ` · 功课 ${grade.homeworkCompleted}/${grade.homeworkTotal}`}</p></Link>)}</div>
    {attention.some((item) => item.grade < 1 || item.grade > 6) && <Link href="/today/grades/other" className="inline-flex min-h-12 items-center text-blue-700 underline">其他年级／历史注意事项</Link>}
    <p className="text-xs text-slate-600">学生数按启用学校、班级和学生统计。注意事项按项目计数，包含未解决的历史任务；一位学生可能有多项。</p>
  </div>;
}
