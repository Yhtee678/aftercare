import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools, students } from "@/db/schema";
import type { CreateStudentInput, CreateStudentResult, EditStudentInput } from "@/lib/validation/student";

export async function updateStudent(input: EditStudentInput): Promise<CreateStudentResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(students)
      .where(eq(students.id, input.id)).limit(1).for("update");
    if (!existing) return { success: false, message: "Student not found. Return to Students and try again." };

    const [activeClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE")))
      .for("share");
    if (!activeClass) return {
      success: false, message: "Select an available school class.",
      fieldErrors: { schoolClassId: "This class is no longer available. Choose an active class." },
    };

    // Identical retries are a no-op, including the audit timestamp.
    if (existing.name === input.name && existing.schoolClassId === input.schoolClassId
      && existing.parentName === input.parentName && existing.parentPhone === input.parentPhone
      && existing.notes === input.notes) return { success: true, id: existing.id };

    const [updated] = await tx.update(students).set({
      name: input.name, schoolClassId: input.schoolClassId,
      parentName: input.parentName, parentPhone: input.parentPhone, notes: input.notes,
      updatedAt: new Date(),
    }).where(eq(students.id, input.id)).returning({ id: students.id });
    return { success: true, id: updated.id };
  });
}

export async function insertStudent(input: CreateStudentInput): Promise<CreateStudentResult> {
  return db.transaction(async (tx) => {
    const findSubmission = () => tx.select({
      id: students.id, name: students.name, schoolClassId: students.schoolClassId,
      parentName: students.parentName, parentPhone: students.parentPhone, notes: students.notes,
    }).from(students).where(eq(students.id, input.submissionId)).limit(1);

    const replayResult = (existing: Awaited<ReturnType<typeof findSubmission>>[number]): CreateStudentResult => {
      const matches = existing.name === input.name && existing.schoolClassId === input.schoolClassId
        && existing.parentName === input.parentName && existing.parentPhone === input.parentPhone
        && existing.notes === input.notes;
      return matches ? { success: true, id: existing.id } : {
        success: false,
        message: "This form has already been used with different details. Open Add Student again to create another student.",
      };
    };

    const [existing] = await findSubmission();
    if (existing) return replayResult(existing);

    // Recheck current availability and hold it stable until the insert commits.
    const [activeClass] = await tx.select({ id: schoolClasses.id }).from(schoolClasses)
      .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE")))
      .for("share");

    if (!activeClass) return {
      success: false, message: "Select an available school class.",
      fieldErrors: { schoolClassId: "This class is no longer available. Choose an active class." },
    };

    const [created] = await tx.insert(students).values({
      id: input.submissionId,
      name: input.name,
      schoolClassId: input.schoolClassId,
      parentName: input.parentName,
      parentPhone: input.parentPhone,
      notes: input.notes,
      status: "ACTIVE",
    }).onConflictDoNothing({ target: students.id }).returning({ id: students.id });

    if (created) return { success: true, id: created.id };
    // A concurrent request with this submission ID may have committed first.
    const [repeated] = await findSubmission();
    if (repeated) return replayResult(repeated);
    throw new Error("Student insert returned no row.");
  });
}
