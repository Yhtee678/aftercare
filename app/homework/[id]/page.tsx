import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { homeworkIdSchema } from "@/lib/validation/homework";
import { HomeworkSummary } from "@/components/homework/homework-summary";
import { HomeworkLoadError } from "@/components/homework/homework-load-error";
import { AssignmentStudentList } from "@/components/students/assignment-student-list";

export const metadata: Metadata = { title: "功课详情" };
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const { id } = await params;
  if (!homeworkIdSchema.safeParse(id).success) notFound();
  let data;
  try {
    const { getHomeworkTask } = await import("@/db/queries/homework");
    data = await getHomeworkTask(id);
  } catch {
    console.error("Homework detail: query failed.");
    return <HomeworkLoadError href={`/homework/${id}`} />;
  }
  if (!data) notFound();
  const completed = data.assignments.filter((item) => item.status === "COMPLETED").length;
  return <div className="max-w-2xl space-y-6">
    <Link href={data.task.schoolClassId ? `/homework/classes/${data.task.schoolClassId}` : "/homework"} className="inline-flex min-h-12 items-center text-blue-700 underline">{data.task.schoolClassId ? "返回班级功课" : "返回功课"}</Link>
    <h1 className="text-2xl font-semibold">功课详情</h1>
    {(await searchParams).created === "1" && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">功课已保存并分配。</p>}
    <HomeworkSummary task={data.task} />
    {data.task.taskType && <p className="break-words text-sm text-slate-600">{data.task.taskType}</p>}
    <section className="space-y-3" aria-labelledby="assigned-heading">
      <h2 id="assigned-heading" className="text-lg font-semibold">已分配学生</h2>
      <p className="text-sm text-slate-600">{completed} / {data.assignments.length} 已完成 · {data.assignments.length - completed} 未完成。老师确认全部完成后，方可标记完成。</p>
      <AssignmentStudentList kind="homework" assignments={data.assignments} />
    </section>
  </div>;
}
