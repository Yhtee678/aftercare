import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCareStudents } from "./care";
import { nextCalendarDate } from "@/lib/dictation-due";

export async function getDailyClassStudents(classId: string, today: string) {
  // Aggregate each source separately, restricted to this roster; no multiplied joins.
  const [roster, homework, dictation] = await Promise.all([
    getCareStudents(classId, today),
    db.execute<{ studentId: string; total: number; completed: number; corrections: number }>(sql`
      select sh.student_id as "studentId", count(*)::int as total,
        count(*) filter (where sh.status = 'COMPLETED')::int as completed,
        count(*) filter (where sh.status = 'CORRECTION_REQUIRED')::int as corrections
      from student_homework sh join homework_tasks h on h.id = sh.homework_task_id
      join students s on s.id = sh.student_id
      where s.school_class_id = ${classId} and s.status = 'ACTIVE'
        and (h.task_date = ${today}::date or sh.status = 'CORRECTION_REQUIRED')
      group by sh.student_id
    `),
    db.execute<{ studentId: string; total: number; completed: number; practice: number; schoolTotal: number; schoolCompleted: number; tuitionTotal: number; tuitionCompleted: number }>(sql`
      select sd.student_id as "studentId", count(*)::int as total,
        count(*) filter (where sd.status = 'COMPLETED')::int as completed,
        count(*) filter (where sd.status = 'NEEDS_PRACTICE')::int as practice,
        count(*) filter (where d.source = 'SCHOOL')::int as "schoolTotal",
        count(*) filter (where d.source = 'SCHOOL' and sd.status = 'COMPLETED')::int as "schoolCompleted",
        count(*) filter (where d.source = 'TUITION')::int as "tuitionTotal",
        count(*) filter (where d.source = 'TUITION' and sd.status = 'COMPLETED')::int as "tuitionCompleted"
      from student_dictation sd join dictation_tasks d on d.id = sd.dictation_task_id
      join students s on s.id = sd.student_id
      where s.school_class_id = ${classId} and s.status = 'ACTIVE'
        and d.scheduled_date <= ${nextCalendarDate(today)}::date
        and (d.scheduled_date >= ${today}::date or sd.status <> 'COMPLETED')
      group by sd.student_id
    `),
  ]);
  const homeworkByStudent = new Map(homework.map((item) => [item.studentId, item]));
  const dictationByStudent = new Map(dictation.map((item) => [item.studentId, item]));
  return roster.map((student) => {
    const h = homeworkByStudent.get(student.studentId), d = dictationByStudent.get(student.studentId);
    return { ...student, arrivalTime: student.arrivalTime?.toISOString() ?? null,
      mealCompleted: !!student.mealCompleted, showerCompleted: !!student.showerCompleted,
      bagChecked: !!student.bagChecked, finalCheckCompleted: !!student.finalCheckCompleted,
      homeworkTotal: h?.total ?? 0, homeworkCompleted: h?.completed ?? 0, corrections: h?.corrections ?? 0,
      dictationTotal: d?.total ?? 0, dictationCompleted: d?.completed ?? 0, practice: d?.practice ?? 0,
      schoolTotal: d?.schoolTotal ?? 0, schoolCompleted: d?.schoolCompleted ?? 0,
      tuitionTotal: d?.tuitionTotal ?? 0, tuitionCompleted: d?.tuitionCompleted ?? 0,
    };
  });
}
