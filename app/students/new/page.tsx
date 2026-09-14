import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import Link from "next/link";
import { connection } from "next/server";
import { AddStudentForm } from "@/components/students/add-student-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "添加学生" };

export default async function Page() {
  await connection();
  let classes;
  try {
    const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
    classes = await getActiveSchoolClasses();
  } catch {
    console.error("Add Student page: active school class query failed.");
    return <div className="space-y-4">
      <h1 className="text-2xl font-semibold">添加学生</h1>
      <p role="alert" className="text-sm text-slate-600">暂时无法加载班级，请重试。</p>
      {/* A full reload retries the failed database read instead of reusing this route. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/students/new" className="inline-flex min-h-12 items-center text-blue-700 underline">重试</a>
    </div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">添加学生</h1>
        <p className="text-sm leading-6 text-slate-600">填写学生姓名及目前就读班级，家长资料与备注可选填。</p>
      </div>
      <Card className="shadow-none"><CardContent>
        {classes.length ? <AddStudentForm classes={classes} submissionId={randomUUID()} /> : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">暂无可用班级，请先添加并启用班级，再添加学生。</p>
            <Link href="/students" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">返回学生</Link>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
