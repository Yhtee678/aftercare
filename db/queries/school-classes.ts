import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools } from "@/db/schema";

export function getActiveSchoolClasses() {
  return db.select({
    id: schoolClasses.id,
    schoolName: schools.name,
    academicYear: schoolClasses.academicYear,
    grade: schoolClasses.grade,
    className: schoolClasses.className,
  }).from(schoolClasses)
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .where(and(eq(schoolClasses.status, "ACTIVE"), eq(schools.status, "ACTIVE")))
    .orderBy(asc(schools.name), asc(schoolClasses.academicYear), asc(schoolClasses.grade), asc(schoolClasses.className), asc(schoolClasses.id));
}

export type SchoolClassOption = Awaited<ReturnType<typeof getActiveSchoolClasses>>[number];
