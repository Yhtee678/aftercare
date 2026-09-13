import type { Metadata } from "next";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";
import { z } from "zod";

export const metadata: Metadata = { title: "Students" };

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
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p role="alert" className="text-sm text-slate-600">Unable to load students. Please try again.</p>
        {/* A full reload retries the failed database read instead of reusing this route. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/students" className="inline-flex min-h-12 items-center rounded-lg px-4 text-sm font-medium text-blue-700 underline focus-visible:outline-2">Try again</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-sm leading-6 text-slate-600">Students and their current school classes.</p>
        </div>
        <Link href="/students/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          <Plus aria-hidden="true" className="size-4" /> Add Student
        </Link>
      </div>
      {created.success && studentList.some((student) => student.id === created.data) && (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">Student added successfully.</p>
      )}
      {studentList.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No students recorded yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {studentList.map((student) => (
            <li key={student.id}>
              <Link href={`/students/${student.id}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              <Card className="h-full shadow-none hover:border-blue-300">
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="min-w-0 break-words text-base font-medium">{student.name}</h2>
                    <Badge variant="secondary" className={student.status === "ACTIVE" ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}>
                      {student.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="break-words text-sm text-slate-600">{student.schoolName}</p>
                  <p className="text-sm text-slate-600">Grade {student.grade} · {student.className}</p>
                </CardContent>
              </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
