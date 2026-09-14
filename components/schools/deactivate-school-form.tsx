"use client";

import { deactivateSchool } from "@/app/more/schools/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateSchoolForm({ id, name }: { id: string; name: string }) {
  return <DeactivateRecordForm name={name} label="停用学校"
    description="此学校的班级将不再可供选择，原有班级、学生及记录都会保留。"
    successMessage="学校已停用。"
    confirmAction={(confirmed) => deactivateSchool({ id, confirmed })}
    successHref={(schoolId) => `/more/schools/${schoolId}?deactivated=1`} />;
}
