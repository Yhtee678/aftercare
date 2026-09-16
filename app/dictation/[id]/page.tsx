import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { dictationSourceLabels, dictationTypeLabels, dictationIdSchema } from "@/lib/validation/dictation";
import { DictationSummary } from "@/components/dictation/dictation-summary";
import { DictationLoadError } from "@/components/dictation/dictation-load-error";
import { AssignmentStudentList } from "@/components/students/assignment-student-list";
import { TaskAssignmentManager } from "@/components/students/task-assignment-manager";

export const metadata: Metadata = { title: "听写详情" };
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const { id } = await params;
  if (!dictationIdSchema.safeParse(id).success) notFound();
  let data;
  let today;
  try {
    const { getDictationTask } = await import("@/db/queries/dictation");
    const { getCareToday } = await import("@/db/queries/care");
    [data, today] = await Promise.all([getDictationTask(id), getCareToday()]);
  } catch {
    console.error("Dictation detail: query failed.");
    return <DictationLoadError href={`/dictation/${id}`} />;
  }
  if (!data) notFound();
  const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
  const { getActiveAssignmentStudents } = await import("@/db/queries/assignment-students");
  const [classes, students] = await Promise.all([getActiveSchoolClasses(), getActiveAssignmentStudents()]);
  const completed = data.assignments.filter((item) => item.status === "COMPLETED").length;
  return <div className="max-w-2xl space-y-6">
    <Link href={data.task.schoolClassId ? `/dictation/classes/${data.task.schoolClassId}` : "/dictation"} className="inline-flex min-h-12 items-center text-blue-700 underline">{data.task.schoolClassId ? "返回班级听写" : "返回听写"}</Link>
    <h1 className="text-2xl font-semibold">听写详情</h1>
    {(await searchParams).created === "1" && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">听写已保存并分配。</p>}
    <DictationSummary task={data.task} today={today} unresolved={completed < data.assignments.length} />
    {data.task.schoolClassId && <TaskAssignmentManager kind="dictation" taskId={id} initialClassId={data.task.schoolClassId} classes={classes} students={students} assignments={data.assignments} />}
    <section className="space-y-3" aria-labelledby="assigned-heading">
      <h2 id="assigned-heading" className="text-lg font-semibold">已分配学生</h2>
      <p className="text-sm text-slate-600">{completed} / {data.assignments.length} 已完成 · {data.assignments.length - completed} 未完成。老师确认全部完成后，方可标记完成。</p>
      <AssignmentStudentList kind="dictation" assignments={data.assignments} context={`${data.task.schoolName ?? ""} · ${data.task.className ?? "个人听写"}\n${dictationSourceLabels[data.task.source]}${dictationTypeLabels[data.task.type]} · ${data.task.scheduledDate.split("-").reverse().join("/")}`} />
    </section>
  </div>;
}
