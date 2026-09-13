import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { CareLoadError } from "@/components/care/care-load-error";
import { CareStudentRow } from "@/components/care/care-student-row";

export const metadata: Metadata = { title: "Class Care" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let schoolClass;
  let students;
  let today;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    const { getCareToday, getCareStudents } = await import("@/db/queries/care");
    [schoolClass, today] = await Promise.all([getSchoolClass(id), getCareToday()]);
    students = schoolClass ? await getCareStudents(id, today) : [];
  } catch {
    console.error("Class Care: query failed.");
    return <CareLoadError href={`/care/classes/${id}`} />;
  }
  if (!schoolClass) notFound();
  const readOnly = schoolClass.status !== "ACTIVE" || schoolClass.schoolStatus !== "ACTIVE";
  return <div className="max-w-4xl space-y-6">
    <Link href="/care" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Grades and Classes</Link>
    <div><h1 className="break-words text-2xl font-semibold">{schoolClass.className} Care</h1>
      <p className="mt-2 break-words text-sm text-slate-600">{schoolClass.schoolName} · {schoolClass.academicYear} · Grade {schoolClass.grade}</p>
      <p className="mt-2 text-sm text-slate-600">Today · {today} · Malaysia time. Record arrival, then tap each completed check.</p>
    </div>
    {readOnly && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">This class or school is inactive. Existing care is read-only.</p>}
    {students.length ? <ul className="space-y-3">{students.map((student) => {
      const changedContext = student.recordedClassId && (student.recordedClassId !== id || student.recordedClassName !== schoolClass.className
        || student.recordedSchoolName !== schoolClass.schoolName || student.recordedGrade !== schoolClass.grade || student.recordedAcademicYear !== schoolClass.academicYear);
      return <CareStudentRow key={`${today}:${student.studentId}`} schoolClassId={id} recordDate={today} readOnly={readOnly}
        student={{ ...student, arrivalTime: student.arrivalTime?.toISOString() ?? null }}
        originalClass={changedContext ? `${student.recordedSchoolName} · ${student.recordedAcademicYear} · Grade ${student.recordedGrade} · ${student.recordedClassName}` : null} />;
    })}</ul> : <p className="rounded-xl border bg-white p-6 text-slate-600">No active students in this class.</p>}
  </div>;
}
