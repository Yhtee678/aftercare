import "server-only";

import { asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { dictationTasks, schoolClasses, schools, studentDictation, students } from "@/db/schema";
import { nextCalendarDate } from "@/lib/dictation-due";
import type { DictationStatus, DictationFormValues } from "@/lib/validation/dictation";

export type DictationAttention = {
  id: string; taskId: string; studentName: string; classId: string; className: string;
  schoolName: string; grade: number; academicYear: number; description: string;
  source: DictationFormValues["source"]; type: DictationFormValues["type"]; scheduledDate: string; status: DictationStatus;
};
export function getDueDictations(today: string) {
  return db.execute<DictationAttention>(sql`
    select sd.id, d.id as "taskId", s.name as "studentName", c.id as "classId", c.class_name as "className",
      sc.name as "schoolName", c.grade, c.academic_year as "academicYear", d.description, d.source, d.type,
      d.scheduled_date::text as "scheduledDate", sd.status
    from student_dictation sd join dictation_tasks d on d.id = sd.dictation_task_id
    join students s on s.id = sd.student_id join school_classes c on c.id = coalesce(d.school_class_id, s.school_class_id)
    join schools sc on sc.id = c.school_id
    where sd.status <> 'COMPLETED' and d.scheduled_date <= ${nextCalendarDate(today)}::date
    order by c.grade, c.class_name, s.name, sc.name, c.academic_year, c.id, sd.id
  `);
}

const context = { schoolName: schools.name, className: schoolClasses.className, grade: schoolClasses.grade, academicYear: schoolClasses.academicYear };
export function getDictationClasses() {
  return db.select({ id: schoolClasses.id, ...context, status: schoolClasses.status,
    schoolStatus: schools.status, taskCount: sql<number>`count(${dictationTasks.id})::integer`,
  }).from(schoolClasses)
    .innerJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .leftJoin(dictationTasks, eq(dictationTasks.schoolClassId, schoolClasses.id))
    .groupBy(schoolClasses.id, schools.name, schools.status)
    .orderBy(asc(schoolClasses.grade), asc(schoolClasses.className), asc(schools.name), desc(schoolClasses.academicYear), asc(schoolClasses.id));
}

export function getDictationTasks(schoolClassId: string) {
  const total = sql<number>`count(${studentDictation.id})::integer`;
  const completed = sql<number>`count(${studentDictation.id}) filter (where ${studentDictation.status} = 'COMPLETED')::integer`;
  const corrections = sql<number>`count(${studentDictation.id}) filter (where ${studentDictation.status} = 'NEEDS_PRACTICE')::integer`;
  return db.select({ id: dictationTasks.id, contentFormat: dictationTasks.contentFormat, type: dictationTasks.type, source: dictationTasks.source, description: dictationTasks.description,
    assignedDate: dictationTasks.assignedDate, scheduledDate: dictationTasks.scheduledDate,
    ...context, total, completed, corrections,
  }).from(dictationTasks)
    .leftJoin(schoolClasses, eq(dictationTasks.schoolClassId, schoolClasses.id))
    .leftJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .leftJoin(studentDictation, eq(studentDictation.dictationTaskId, dictationTasks.id))
    .where(eq(dictationTasks.schoolClassId, schoolClassId))
    .groupBy(dictationTasks.id, schools.name, schoolClasses.className, schoolClasses.grade, schoolClasses.academicYear)
    .orderBy(desc(sql`${total} > ${completed}`), asc(dictationTasks.scheduledDate), asc(dictationTasks.id));
}

export async function getDictationTask(id: string) {
  const [task] = await db.select({ ...getTableColumns(dictationTasks), ...context }).from(dictationTasks)
    .leftJoin(schoolClasses, eq(dictationTasks.schoolClassId, schoolClasses.id))
    .leftJoin(schools, eq(schoolClasses.schoolId, schools.id))
    .where(eq(dictationTasks.id, id));
  if (!task) return undefined;
  const assignments = await db.select({ id: studentDictation.id, studentName: students.name, status: studentDictation.status })
    .from(studentDictation).innerJoin(students, eq(studentDictation.studentId, students.id))
    .where(eq(studentDictation.dictationTaskId, id))
    .orderBy(asc(sql`case ${studentDictation.status} when 'NEEDS_PRACTICE' then 0 when 'PENDING' then 1 else 2 end`), asc(students.name), asc(studentDictation.id));
  return { task, assignments };
}
