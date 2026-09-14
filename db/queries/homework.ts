import "server-only";

import { asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { homeworkTasks, schoolClasses, schools, studentHomework, students } from "@/db/schema";

const context = { schoolName: schools.name, className: schoolClasses.className, grade: schoolClasses.grade, academicYear: schoolClasses.academicYear };
export function getHomeworkClasses() {
  return db.select({ id: schoolClasses.id, ...context, status: schoolClasses.status,
    schoolStatus: schools.status, taskCount: sql<number>`count(${homeworkTasks.id})::integer`,
  }).from(schoolClasses)
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .leftJoin(homeworkTasks, eq(homeworkTasks.schoolClassId, schoolClasses.id))
    .groupBy(schoolClasses.id, schools.name, schools.status)
    .orderBy(asc(schoolClasses.grade), asc(schoolClasses.className), asc(schools.name), desc(schoolClasses.academicYear), asc(schoolClasses.id));
}

export function getHomeworkTasks(schoolClassId: string) {
  const total = sql<number>`count(${studentHomework.id})::integer`;
  const completed = sql<number>`count(${studentHomework.id}) filter (where ${studentHomework.status} = 'COMPLETED')::integer`;
  const corrections = sql<number>`count(${studentHomework.id}) filter (where ${studentHomework.status} = 'CORRECTION_REQUIRED')::integer`;
  return db.select({ id: homeworkTasks.id, subject: homeworkTasks.subject, taskType: homeworkTasks.taskType, description: homeworkTasks.description,
    taskDate: homeworkTasks.taskDate, pageFrom: homeworkTasks.pageFrom, pageTo: homeworkTasks.pageTo,
    ...context, total, completed, corrections,
  }).from(homeworkTasks)
    .leftJoin(schoolClasses, eq(homeworkTasks.schoolClassId, schoolClasses.id))
    .leftJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .leftJoin(studentHomework, eq(studentHomework.homeworkTaskId, homeworkTasks.id))
    .where(eq(homeworkTasks.schoolClassId, schoolClassId))
    .groupBy(homeworkTasks.id, schools.name, schoolClasses.className, schoolClasses.grade, schoolClasses.academicYear)
    .orderBy(desc(sql`${total} > ${completed}`), desc(homeworkTasks.taskDate), desc(homeworkTasks.createdAt));
}

export async function getHomeworkTask(id: string) {
  const [task] = await db.select({ ...getTableColumns(homeworkTasks), ...context }).from(homeworkTasks)
    .leftJoin(schoolClasses, eq(homeworkTasks.schoolClassId, schoolClasses.id))
    .leftJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .where(eq(homeworkTasks.id, id));
  if (!task) return undefined;
  const assignments = await db.select({ id: studentHomework.id, studentName: students.name, status: studentHomework.status })
    .from(studentHomework).innerJoin(students, eq(studentHomework.studentId, students.id))
    .where(eq(studentHomework.homeworkTaskId, id))
    .orderBy(asc(sql`case ${studentHomework.status} when 'CORRECTION_REQUIRED' then 0 when 'PENDING' then 1 else 2 end`), asc(students.name), asc(studentHomework.id));
  return { task, assignments };
}
