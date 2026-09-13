import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyStudentRecords, students } from "@/db/schema";
import { getCareDate } from "@/lib/care-date";

export async function getCareToday() {
  const [clock] = await db.execute<{ now: string }>(sql`select now()::text as now`);
  return getCareDate(new Date(clock.now));
}

export function getCareStudents(schoolClassId: string, recordDate: string) {
  return db.select({ studentId: students.id, name: students.name,
    arrivalTime: dailyStudentRecords.arrivalTime, mealCompleted: dailyStudentRecords.mealCompleted,
    showerCompleted: dailyStudentRecords.showerCompleted, bagChecked: dailyStudentRecords.bagChecked,
    finalCheckCompleted: dailyStudentRecords.finalCheckCompleted,
    recordedClassId: dailyStudentRecords.schoolClassId, recordedClassName: dailyStudentRecords.className,
    recordedSchoolName: dailyStudentRecords.schoolName, recordedGrade: dailyStudentRecords.grade,
    recordedAcademicYear: dailyStudentRecords.academicYear,
  }).from(students).leftJoin(dailyStudentRecords, and(eq(dailyStudentRecords.studentId, students.id), eq(dailyStudentRecords.recordDate, recordDate)))
    .where(and(eq(students.schoolClassId, schoolClassId), eq(students.status, "ACTIVE")))
    .orderBy(asc(students.name), asc(students.id));
}
