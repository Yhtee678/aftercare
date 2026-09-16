import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

export function getActiveAssignmentStudents() {
  return db.select({ id: students.id, name: students.name, schoolClassId: students.schoolClassId })
    .from(students).where(eq(students.status, "ACTIVE"))
    .orderBy(asc(students.name), asc(students.id));
}
