import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools } from "@/db/schema";

const classDetails = {
  id: schoolClasses.id, schoolId: schoolClasses.schoolId, schoolName: schools.name,
  schoolStatus: schools.status, academicYear: schoolClasses.academicYear,
  grade: schoolClasses.grade, className: schoolClasses.className, status: schoolClasses.status,
  createdAt: schoolClasses.createdAt, updatedAt: schoolClasses.updatedAt,
};

export function getSchoolClasses() {
  return db.select(classDetails).from(schoolClasses)
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .orderBy(asc(schools.name), asc(schoolClasses.academicYear), asc(schoolClasses.grade), asc(schoolClasses.className), asc(schoolClasses.id));
}

export async function getSchoolClass(id: string) {
  const [schoolClass] = await db.select(classDetails).from(schoolClasses)
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .where(eq(schoolClasses.id, id)).limit(1);
  return schoolClass;
}

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
