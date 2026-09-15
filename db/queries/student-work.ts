import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { HomeworkStatus } from "@/lib/validation/homework";
import type { DictationStatus, dictationTypeLabels } from "@/lib/validation/dictation";
export type StudentHomeworkItem = { id: string; studentId: string; taskId: string; subject: string; taskType: string | null; description: string; taskDate: string; pageFrom: number | null; pageTo: number | null; status: HomeworkStatus };
export type StudentDictationItem = { studentId: string; type: keyof typeof dictationTypeLabels; source: "SCHOOL" | "TUITION"; status: DictationStatus };
export async function getStudentWork(classId: string, today: string, includeCarryover = false) {
  const [roster, homework, dictation] = await Promise.all([
    db.execute<{ id: string; name: string }>(sql`select id, name from students where school_class_id = ${classId} and status = 'ACTIVE' order by name, id`),
    db.execute<StudentHomeworkItem>(sql`
      select sh.id, sh.student_id as "studentId", h.id as "taskId", h.subject, h.task_type as "taskType", h.description,
        h.task_date::text as "taskDate", h.page_from as "pageFrom", h.page_to as "pageTo", sh.status
      from student_homework sh join homework_tasks h on h.id = sh.homework_task_id join students s on s.id = sh.student_id
      where s.school_class_id = ${classId} and s.status = 'ACTIVE'
        and (h.task_date = ${today}::date or (${includeCarryover} and h.task_date < ${today}::date and sh.status <> 'COMPLETED'))
      order by h.task_date, h.created_at, h.id, sh.id
    `),
    db.execute<StudentDictationItem>(sql`
      select sd.student_id as "studentId", d.type, d.source, sd.status from student_dictation sd
      join dictation_tasks d on d.id = sd.dictation_task_id join students s on s.id = sd.student_id
      where s.school_class_id = ${classId} and s.status = 'ACTIVE'
        and (d.assigned_date = ${today}::date or d.scheduled_date = ${today}::date)
      order by d.scheduled_date, d.created_at, d.id, sd.id
    `),
  ]);
  const homeworkMap = new Map<string, StudentHomeworkItem[]>();
  const dictationMap = new Map<string, StudentDictationItem[]>();
  for (const item of homework) homeworkMap.set(item.studentId, [...(homeworkMap.get(item.studentId) ?? []), item]);
  for (const item of dictation) dictationMap.set(item.studentId, [...(dictationMap.get(item.studentId) ?? []), item]);
  return roster.map(student => ({ ...student, homework: homeworkMap.get(student.id) ?? [], dictation: dictationMap.get(student.id) ?? [] }));
}
