import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { completionState, completionStyles, completionLabels } from "@/lib/workflow-display";
export const metadata = { title: "班级今日概况" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connection(); const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let data;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    const { getCareToday } = await import("@/db/queries/care");
    const { getDailyClassStudents } = await import("@/db/queries/daily-overview");
    const [schoolClass, today] = await Promise.all([getSchoolClass(id), getCareToday()]);
    data = { schoolClass, today, students: schoolClass ? await getDailyClassStudents(id, today) : [] };
  } catch { return <p role="alert">暂时无法加载班级资料，请刷新重试。</p>; }
  if (!data.schoolClass) notFound();
  const rank = { attention: 0, progress: 1, "not-arrived": 2, complete: 3 };
  const students = [...data.students].sort((a, b) => rank[completionState(a)] - rank[completionState(b)]);
  return <div className="space-y-4"><Link href={`/today/grades/${data.schoolClass.grade >= 1 && data.schoolClass.grade <= 6 ? data.schoolClass.grade : "other"}`} className="inline-flex min-h-12 items-center text-blue-700 underline">返回年级</Link><h1 className="text-2xl font-semibold">{data.schoolClass.schoolName} · {data.schoolClass.className}</h1><p>{data.today} · 今日</p><div className="flex flex-wrap gap-4">{[["care", "托育"], ["homework", "功课"], ["dictation", "听写"]].map(([route, label]) => <Link key={route} href={`/${route}/classes/${id}`} prefetch={false} className="inline-flex min-h-12 items-center rounded-lg border bg-white px-4 text-blue-700">{label}</Link>)}</div><ul className="grid gap-3 sm:grid-cols-2">{students.map((student) => { const state = completionState(student); return <li key={student.studentId} className={`space-y-2 rounded-xl border p-4 ${completionStyles[state]}`}><Link href={`/students/${student.studentId}`} className="inline-flex min-h-12 items-center font-semibold underline">{student.name}</Link><p className="font-medium">{completionLabels[state]}</p><p className="text-sm">功课 {student.homeworkCompleted}/{student.homeworkTotal} · 听写 {student.dictationCompleted}/{student.dictationTotal}</p>{student.corrections > 0 && <p className="text-sm text-red-800">{student.corrections} 项功课需要订正</p>}<p className="text-sm">最终检查：{student.finalCheckCompleted ? "已完成" : "未完成"}</p></li>; })}</ul>{!students.length && <p>此班级暂无启用的学生。</p>}</div>;
}
