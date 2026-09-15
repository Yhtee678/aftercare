import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { PrintButton } from "@/components/care/print-button";
import { CareLoadError } from "@/components/care/care-load-error";
import { dailySheetCells, dailySheetColumns } from "@/lib/daily-sheet";
export const metadata = { title: "每日托育总表" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connection(); const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let data;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    const { getCareToday } = await import("@/db/queries/care");
    const { getStudentWork } = await import("@/db/queries/student-work");
    const { getDailyClassStudents } = await import("@/db/queries/daily-overview");
    const [schoolClass, today] = await Promise.all([getSchoolClass(id), getCareToday()]);
    const [daily, work] = schoolClass ? await Promise.all([getDailyClassStudents(id, today), getStudentWork(id, today)]) : [[], []];
    const byStudent = new Map(work.map(student => [student.id, student]));
    data = { schoolClass, today, students: daily.map(student => ({ ...student, homework: byStudent.get(student.studentId)?.homework ?? [], dictation: byStudent.get(student.studentId)?.dictation ?? [] })) };
  } catch { return <CareLoadError href={`/care/classes/${id}/print`} />; }
  if (!data.schoolClass) notFound();
  const schoolClass = data.schoolClass;
  return <div className="daily-sheet space-y-4"><div className="flex flex-wrap gap-4 print:hidden"><Link href={`/care/classes/${id}`} className="inline-flex min-h-12 items-center text-blue-700">返回托育</Link><PrintButton /></div><h1 className="text-xl font-semibold">辅成托育管理 · 每日托育总表</h1><p>{schoolClass.schoolName} · {schoolClass.className} · {data.today}（马来西亚时间）</p><div className="overflow-x-auto print:overflow-visible"><table className="w-full border-collapse text-xs"><thead><tr>{dailySheetColumns.map((column) => <th key={column} className="border border-slate-500 p-2">{column}</th>)}</tr></thead><tbody>{data.students.map((student, index) => <tr key={student.studentId}>{dailySheetCells({ ...student, remark: [student.remark, student.recordedClassId && (student.recordedClassId !== id || student.recordedClassName !== schoolClass.className || student.recordedSchoolName !== schoolClass.schoolName) ? `首次记录：${student.recordedSchoolName} · ${student.recordedClassName}` : null].filter(Boolean).join("；") }, index, schoolClass.schoolName, schoolClass.className).map((cell, column) => <td key={column} className="border border-slate-500 p-2">{cell}</td>)}</tr>)}</tbody></table></div>{!data.students.length && <p>此班级暂无启用的学生。</p>}<p className="text-xs text-slate-600">功课列出今日全部已分配任务，包含已完成项目。听写列出今日安排或今日到期的全部任务，包含已完成项目；学＝学校，补＝补习／托育中心。无任务显示 -。</p><p className="text-xs text-slate-600">“补做功课”尚未单独记录，以 — 表示。all done 沿用原规则：已到班、书包与最终检查已完成，且今日功课及过往待订正功课、今日／明日及过往未完成听写全部完成。此表不表示已联系家长或获准离开。</p></div>;
}
