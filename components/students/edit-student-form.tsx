"use client";

import { editStudent } from "@/app/students/[id]/edit/actions";
import { StudentForm } from "@/components/students/student-form";
import type { SchoolClassOption } from "@/db/queries/school-classes";
import type { StudentFormValues } from "@/lib/validation/student";

export function EditStudentForm({ id, classes, initialValues }: {
  id: string; classes: SchoolClassOption[]; initialValues: StudentFormValues;
}) {
  return <StudentForm editing classes={classes} initialValues={initialValues}
    saveAction={(values) => editStudent({ ...values, id })}
    successHref={(studentId) => `/students/${studentId}?updated=1`} cancelHref={`/students/${id}`} />;
}
