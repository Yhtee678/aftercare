import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCareToday } from "./care";
import { getDueDictations } from "./dictation";

type Context = { id: string; studentName: string; classId: string; className: string; schoolName: string; grade: number; academicYear: number };
type Correction = Context & { taskId: string; subject: string; description: string; pageFrom: number | null; pageTo: number | null; taskDate: string };
type Bag = Context & { arrivalTime: string };
type ClassSummary = { id: string; className: string; schoolName: string; grade: number; academicYear: number;
  activeStudents: number; arrived: number; bagsChecked: number; homeworkCompleted: number; homeworkTotal: number };

export async function getTodayOverview() {
  const today = await getCareToday();
  // Separate aggregates prevent roster × homework joins from multiplying counts.
  const [corrections, bags, classes, dictations] = await Promise.all([
    db.execute<Correction>(sql`
      select sh.id, s.name as "studentName", c.id as "classId", c.class_name as "className",
        sc.name as "schoolName", c.grade, c.academic_year as "academicYear",
        h.id as "taskId", h.subject, h.description, h.page_from as "pageFrom", h.page_to as "pageTo", h.task_date::text as "taskDate"
      from student_homework sh join homework_tasks h on h.id = sh.homework_task_id
      join students s on s.id = sh.student_id
      join school_classes c on c.id = coalesce(h.school_class_id, s.school_class_id)
      join schools sc on sc.id = c.school_id
      where sh.status = 'CORRECTION_REQUIRED'
      order by c.grade, c.class_name, s.name, sc.name, c.academic_year, c.id, sh.id
    `),
    db.execute<Bag>(sql`
      select d.id, s.name as "studentName", c.id as "classId", c.class_name as "className",
        sc.name as "schoolName", c.grade, c.academic_year as "academicYear", d.arrival_time::text as "arrivalTime"
      from daily_student_records d join students s on s.id = d.student_id
      join school_classes c on c.id = s.school_class_id join schools sc on sc.id = c.school_id
      where d.record_date = ${today}::date and d.arrival_time is not null and d.bag_checked = false
        and s.status = 'ACTIVE' and c.status = 'ACTIVE' and sc.status = 'ACTIVE'
      order by c.grade, c.class_name, s.name, sc.name, c.academic_year, c.id, d.id
    `),
    db.execute<ClassSummary>(sql`
      with roster as (
        select s.school_class_id as class_id, count(*)::integer as active_students,
          count(d.id) filter (where d.arrival_time is not null)::integer as arrived,
          count(d.id) filter (where d.bag_checked)::integer as bags_checked
        from students s left join daily_student_records d on d.student_id = s.id and d.record_date = ${today}::date
        where s.status = 'ACTIVE' group by s.school_class_id
      ), homework as (
        select coalesce(h.school_class_id, s.school_class_id) as class_id,
          count(*)::integer as total, count(*) filter (where sh.status = 'COMPLETED')::integer as completed
        from student_homework sh join homework_tasks h on h.id = sh.homework_task_id
        join students s on s.id = sh.student_id where h.task_date = ${today}::date
        group by coalesce(h.school_class_id, s.school_class_id)
      )
      select c.id, c.class_name as "className", sc.name as "schoolName", c.grade, c.academic_year as "academicYear",
        coalesce(r.active_students, 0) as "activeStudents", coalesce(r.arrived, 0) as arrived,
        coalesce(r.bags_checked, 0) as "bagsChecked", coalesce(h.completed, 0) as "homeworkCompleted", coalesce(h.total, 0) as "homeworkTotal"
      from school_classes c join schools sc on sc.id = c.school_id
      left join roster r on r.class_id = c.id left join homework h on h.class_id = c.id
      where c.status = 'ACTIVE' and sc.status = 'ACTIVE'
      order by c.grade, c.class_name, sc.name, c.academic_year, c.id
    `),
    getDueDictations(today),
  ]);
  const attentionCounts = new Map<string, number>();
  const dictationCounts = new Map<string, number>();
  for (const item of dictations) dictationCounts.set(item.classId, (dictationCounts.get(item.classId) ?? 0) + 1);
  for (const item of [...corrections, ...bags, ...dictations]) attentionCounts.set(item.classId, (attentionCounts.get(item.classId) ?? 0) + 1);
  return { today, dueDictations: dictations.filter((item) => item.scheduledDate <= today), nextDictations: dictations.filter((item) => item.scheduledDate > today), corrections: [...corrections], bags: [...bags], classes: classes.map((item) => ({
    ...item, attentionCount: attentionCounts.get(item.id) ?? 0, dictationCount: dictationCounts.get(item.id) ?? 0,
  })).filter((item) => item.activeStudents || item.homeworkTotal || item.attentionCount) };
}
