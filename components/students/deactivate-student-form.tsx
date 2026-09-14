"use client";

import { deactivateStudent } from "@/app/students/[id]/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateStudentForm({ id, name }: { id: string; name: string }) {
  return <DeactivateRecordForm name={name} label="停用学生"
    description="学生将被停用，个人资料和原有记录都会保留。"
    successMessage="学生已停用。"
    confirmAction={(confirmed) => deactivateStudent({ id, confirmed })}
    successHref={(studentId) => `/students/${studentId}?deactivated=1`} />;
}
