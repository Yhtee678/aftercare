"use client";

import { deactivateSchoolClass } from "@/app/more/classes/actions";
import { DeactivateRecordForm } from "@/components/forms/deactivate-record-form";

export function DeactivateSchoolClassForm({ id, context }: { id: string; context: string }) {
  return <DeactivateRecordForm name={context} label="停用班级"
    description="添加或编辑学生时将无法选择此班级，原有学生及记录都会保留。"
    successMessage="班级已停用。"
    confirmAction={(confirmed) => deactivateSchoolClass({ id, confirmed })}
    successHref={(classId) => `/more/classes/${classId}?deactivated=1`} />;
}
