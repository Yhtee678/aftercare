"use client";

import { deactivateSchoolClass } from "@/app/more/classes/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateSchoolClassForm({ id, context }: { id: string; context: string }) {
  return <DeactivateRecordForm name={context} label="Deactivate School Class"
    description="This class will no longer be available for Student selection. Existing students and records will be preserved."
    successMessage="School class deactivated successfully."
    confirmAction={(confirmed) => deactivateSchoolClass({ id, confirmed })}
    successHref={(classId) => `/more/classes/${classId}?deactivated=1`} />;
}
