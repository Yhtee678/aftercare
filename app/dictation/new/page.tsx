import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { DictationForm } from "@/components/dictation/dictation-form";
import { DictationLoadError } from "@/components/dictation/dictation-load-error";

export const metadata: Metadata = { title: "添加听写" };
export default async function Page({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  await connection();
  let classes;
  let today;
  let students;
  try {
    const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
    const { getCareToday } = await import("@/db/queries/care");
    const { getActiveAssignmentStudents } = await import("@/db/queries/assignment-students");
    [classes, today, students] = await Promise.all([getActiveSchoolClasses(), getCareToday(), getActiveAssignmentStudents()]);
  } catch {
    console.error("Add Dictation: class/date query failed.");
    return <DictationLoadError href="/dictation/new" />;
  }
  const requestedClass = (await searchParams).classId;
  const classId = classes.find((item) => item.id === requestedClass)?.id ?? "";
  return <div className="max-w-2xl space-y-6"><Link href="/dictation" className="inline-flex min-h-12 items-center text-blue-700 underline">返回听写</Link><h1 className="text-2xl font-semibold">添加听写</h1>
    {classes.length ? <DictationForm classes={classes} students={students} submissionId={randomUUID()} today={today} classId={classId} /> : <p>暂无可用班级，请先在“更多”中添加并启用学校和班级。</p>}
  </div>;
}
