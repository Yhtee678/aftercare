import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { EditStudentForm } from "@/components/students/edit-student-form";
import { StudentLoadError } from "@/components/students/student-load-error";
import type { SchoolClassOption } from "@/db/queries/school-classes";

export const metadata: Metadata = { title: "Edit Student" };

export default async function Page({ params }: PageProps<"/students/[id]/edit">) {
  await connection();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let student;
  let classes: SchoolClassOption[] = [];
  try {
    const { getStudent } = await import("@/db/queries/students");
    student = await getStudent(id);
    if (student) {
      const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
      classes = await getActiveSchoolClasses();
    }
  } catch {
    console.error("Edit Student page: student or active class query failed.");
    return <StudentLoadError retryHref={`/students/${id}/edit`} />;
  }
  if (!student) notFound();
  const currentClassAvailable = classes?.some((option) => option.id === student.schoolClassId);
  return <div className="max-w-2xl space-y-6">
    <h1 className="text-2xl font-semibold">Edit Student</h1>
    <p className="text-sm text-slate-600">Update the student’s current information. Parent details and notes are optional.</p>
    <Card className="shadow-none"><CardContent>
      {classes?.length ? <>
        {!currentClassAvailable && <p role="status" className="mb-5 text-sm text-amber-800">The current class is unavailable. Select an active class before saving.</p>}
        <EditStudentForm id={id} classes={classes} initialValues={{
          name: student.name, schoolClassId: currentClassAvailable ? student.schoolClassId : "",
          parentName: student.parentName ?? "", parentPhone: student.parentPhone ?? "", notes: student.notes ?? "",
        }} />
      </> : <div className="space-y-3">
        <p className="text-sm text-slate-600">No active school classes are available. A class must be available before saving changes.</p>
        <Link href={`/students/${id}`} className="inline-flex min-h-12 items-center text-blue-700 underline">Back to student</Link>
      </div>}
    </CardContent></Card>
  </div>;
}
