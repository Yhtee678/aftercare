
import { formatGrade } from "@/lib/ui-labels";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StudentLoadError } from "@/components/students/student-load-error";
import { DeactivateStudentForm } from "@/components/students/deactivate-student-form";

export const metadata: Metadata = { title: "学生资料" };

export default async function Page({ params, searchParams }: PageProps<"/students/[id]">) {
  await connection();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let student;
  try {
    const { getStudent } = await import("@/db/queries/students");
    student = await getStudent(id);
  } catch {
    console.error("Student detail: student query failed.");
    return <StudentLoadError retryHref={`/students/${id}`} />;
  }
  if (!student) notFound();
  const notices = await searchParams;
  const updated = notices.updated === "1";
  const deactivated = notices.deactivated === "1" && student.status === "INACTIVE";
  return <div className="max-w-2xl space-y-6">
    <Link href="/students" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">返回学生</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="min-w-0 break-words text-2xl font-semibold">{student.name}</h1>
      <Link href={`/students/${id}/edit`} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2">
        <Pencil aria-hidden="true" className="size-4" /> 编辑学生
      </Link>
    </div>
    {updated && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">学生资料已更新。</p>}
    {deactivated && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">学生已停用，原有记录已保留。</p>}
    <Card className="shadow-none"><CardContent>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-600">状态</dt><dd className="mt-1"><Badge variant="secondary" className={student.status === "ACTIVE" ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}>{student.status === "ACTIVE" ? "启用中" : "已停用"}</Badge></dd></div>
        {[
          ["目前就读学校", student.schoolName], ["学年", student.academicYear],
          ["年级／班级", `${formatGrade(student.grade)} · ${student.className}`],
          ["家长姓名", student.parentName], ["家长电话", student.parentPhone],
        ].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-1 break-words">{value || "未填写"}</dd></div>)}
        <div className="sm:col-span-2"><dt className="text-sm text-slate-600">备注</dt><dd className="mt-1 whitespace-pre-wrap break-words">{student.notes || "未填写"}</dd></div>
      </dl>
    </CardContent></Card>
    {student.status === "ACTIVE" && <DeactivateStudentForm id={student.id} name={student.name} />}
  </div>;
}
