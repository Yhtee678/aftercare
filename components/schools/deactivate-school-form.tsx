"use client";

import { deactivateSchool } from "@/app/more/schools/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateSchoolForm({ id, name }: { id: string; name: string }) {
  return <DeactivateRecordForm name={name} label="Deactivate School"
    description="Classes under this school will no longer be available for selection. Existing classes, students and records will be preserved."
    successMessage="School deactivated successfully."
    confirmAction={(confirmed) => deactivateSchool({ id, confirmed })}
    successHref={(schoolId) => `/more/schools/${schoolId}?deactivated=1`} />;
}
