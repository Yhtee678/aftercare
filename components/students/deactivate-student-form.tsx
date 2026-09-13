"use client";

import { deactivateStudent } from "@/app/students/[id]/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateStudentForm({ id, name }: { id: string; name: string }) {
  return <DeactivateRecordForm name={name} label="Deactivate Student"
    description="This marks the student as inactive. Their information and existing records will be preserved."
    successMessage="Student deactivated successfully."
    confirmAction={(confirmed) => deactivateStudent({ id, confirmed })}
    successHref={(studentId) => `/students/${studentId}?deactivated=1`} />;
}
