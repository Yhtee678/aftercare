
import { StudentList } from "@/components/students/student-list";
import type { Metadata } from "next";
import { connection } from "next/server";


import Link from "next/link";
import { Plus } from "lucide-react";
import { z } from "zod";

export const metadata: Metadata = { title: "学生" };

export default async function Page({ searchParams }: PageProps<"/students">) {
  await connection();
  const created = z.uuid().safeParse((await searchParams).created);

  let studentList;
  try {
    // Import here so missing configuration also reaches the safe error state.
    const { getStudents } = await import("@/db/queries/students");
    studentList = await getStudents();
  } catch {
    console.error("Students page: unable to load the student/class/school query.");
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">学生</h1>
        <p role="alert" className="text-sm text-slate-600">暂时无法加载学生，请重试。</p>
        {/* A full reload retries the failed database read instead of reusing this route. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/students" className="inline-flex min-h-12 items-center rounded-lg px-4 text-sm font-medium text-blue-700 underline focus-visible:outline-2">重试</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">学生</h1>
          <p className="text-sm leading-6 text-slate-600">查看学生及目前就读班级。</p>
        </div>
        <Link href="/students/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          <Plus aria-hidden="true" className="size-4" /> 添加学生
        </Link>
      </div>
      {created.success && studentList.some((student) => student.id === created.data) && (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">学生已添加。</p>
      )}
      <StudentList students={studentList} />
    </div>
  );
}
