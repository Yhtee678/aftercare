"use client";

import { createStudent } from "@/app/students/new/actions";
import { StudentForm } from "@/components/students/student-form";
import type { SchoolClassOption } from "@/db/queries/school-classes";

export function AddStudentForm({ classes, submissionId }: { classes: SchoolClassOption[]; submissionId: string }) {
  return <StudentForm classes={classes} saveAction={(values) => createStudent({ ...values, submissionId })}
    successHref={(id) => `/students?created=${id}`} cancelHref="/students" />;
}
