import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyStudentRecords, schoolClasses, schools, students } from "@/db/schema";
import { getCareDate } from "@/lib/care-date";
import { careActionSchema, type CareResult } from "@/lib/validation/care";

export async function recordCareAction(raw: unknown): Promise<CareResult> {
  const parsed = careActionSchema.safeParse(raw);
  if (!parsed.success) return { success: false, message: "Invalid care action. Refresh and try again." };
  const input = parsed.data;
  return db.transaction(async (tx) => {
    // Match the operational day to the same PostgreSQL clock used for arrival/audit times.
    const [clock] = await tx.execute<{ now: string }>(sql`select now()::text as now`);
    const today = getCareDate(new Date(clock.now));
    if (input.recordDate !== today) return { success: false, message: "The care day has changed. Refresh before recording today's care." };
    // Serialize first actions/retries for this student; also guard concurrent student edits.
    const [student] = await tx.select().from(students).where(eq(students.id, input.studentId)).for("update");
    if (!student || student.status !== "ACTIVE" || student.schoolClassId !== input.schoolClassId)
      return { success: false, message: "This student is inactive or has changed class. Refresh the class list." };
    const [context] = await tx.select({ schoolName: schools.name, className: schoolClasses.className,
      grade: schoolClasses.grade, academicYear: schoolClasses.academicYear,
    }).from(schoolClasses).innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
      .where(and(eq(schoolClasses.id, input.schoolClassId), eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE"))).for("share");
    if (!context) return { success: false, message: "The class or school is inactive. New care activity is unavailable." };
    const key = and(eq(dailyStudentRecords.studentId, student.id), eq(dailyStudentRecords.recordDate, today));
    if (input.action === "arrival") {
      await tx.insert(dailyStudentRecords).values({ studentId: student.id, recordDate: today,
        schoolClassId: input.schoolClassId, ...context, arrivalTime: sql`now()`,
      }).onConflictDoNothing({ target: [dailyStudentRecords.studentId, dailyStudentRecords.recordDate] });
    }
    const [record] = await tx.select().from(dailyStudentRecords).where(key).for("update");
    if (!record || (input.action !== "arrival" && !record.arrivalTime))
      return { success: false, message: "Record arrival before completing the care checklist." };
    if (input.action === "arrival") {
      if (!record.arrivalTime) await tx.update(dailyStudentRecords).set({ arrivalTime: sql`now()`, updatedAt: sql`now()` }).where(eq(dailyStudentRecords.id, record.id));
    } else if (!record[input.action]) {
      await tx.update(dailyStudentRecords).set({ [input.action]: true, updatedAt: sql`now()` }).where(eq(dailyStudentRecords.id, record.id));
    }
    return { success: true };
  });
}
