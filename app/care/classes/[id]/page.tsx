
import { formatGrade } from "@/lib/ui-labels";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { CareLoadError } from "@/components/care/care-load-error";
import { CareStudentRow } from "@/components/care/care-student-row";

export const metadata: Metadata = { title: "班级托育" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let schoolClass;
  let students;
  let today;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    const { getCareToday } = await import("@/db/queries/care");
    const { getDailyClassStudents } = await import("@/db/queries/daily-overview");
    [schoolClass, today] = await Promise.all([getSchoolClass(id), getCareToday()]);
    students = schoolClass ? await getDailyClassStudents(id, today) : [];
  } catch {
    console.error("Class Care: query failed.");
    return <CareLoadError href={`/care/classes/${id}`} />;
  }
  if (!schoolClass) notFound();
  const readOnly = schoolClass.status !== "ACTIVE" || schoolClass.schoolStatus !== "ACTIVE";
  return <div className="max-w-4xl space-y-6">
    <Link href="/care" className="inline-flex min-h-12 items-center text-blue-700 underline">返回年级与班级</Link>
    <div><h1 className="break-words text-2xl font-semibold">{schoolClass.schoolName} · {schoolClass.className}</h1>
      <p className="mt-2 break-words text-sm text-slate-600">{formatGrade(schoolClass.grade)} · 托育</p>
      <p className="mt-2 text-sm text-slate-600">今日 · {today} · 马来西亚时间。先记录到班，再点选已完成的检查项目。</p>
    </div>
    <Link href={`/care/classes/${id}/print`} className="inline-flex min-h-12 items-center rounded-lg border bg-white px-4 text-blue-700">打印今日表</Link>
    {readOnly && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">此班级或学校已停用，现有托育记录仅供查看。</p>}
    {students.length ? <ul className="space-y-3">{students.map((student) => {
      const changedContext = student.recordedClassId && (student.recordedClassId !== id || student.recordedClassName !== schoolClass.className
        || student.recordedSchoolName !== schoolClass.schoolName || student.recordedGrade !== schoolClass.grade || student.recordedAcademicYear !== schoolClass.academicYear);
      return <CareStudentRow key={`${today}:${student.studentId}`} schoolClassId={id} recordDate={today} readOnly={readOnly}
        student={student}
        originalClass={changedContext ? `${student.recordedSchoolName} · ${student.recordedAcademicYear} · ${formatGrade(student.recordedGrade)} · ${student.recordedClassName}` : null} />;
    })}</ul> : <p className="rounded-xl border bg-white p-6 text-slate-600">此班级暂无启用的学生。</p>}
  </div>;
}
