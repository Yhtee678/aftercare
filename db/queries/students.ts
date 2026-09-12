import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schoolClasses, schools, students } from "@/db/schema";

export function getStudents() {
  return db.select({
    id: students.id,
    name: students.name,
    schoolName: schools.name,
    grade: schoolClasses.grade,
    className: schoolClasses.className,
    status: students.status,
  }).from(students)
    .innerJoin(schoolClasses, eq(students.schoolClassId, schoolClasses.id))
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .orderBy(asc(schools.name), asc(schoolClasses.grade), asc(schoolClasses.className), asc(students.name), asc(students.id));
}
