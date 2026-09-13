import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { homeworkIdSchema } from "@/lib/validation/homework";
import { HomeworkSummary } from "@/components/homework/homework-summary";
import { HomeworkLoadError } from "@/components/homework/homework-load-error";
import { StudentHomeworkRow } from "@/components/homework/student-homework-row";

export const metadata: Metadata = { title: "Homework details" };
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
    <Link href={data.task.schoolClassId ? `/homework/classes/${data.task.schoolClassId}` : "/homework"} className="inline-flex min-h-12 items-center text-blue-700 underline">{data.task.schoolClassId ? "Back to Class Homework" : "Back to Homework"}</Link>
    <h1 className="text-2xl font-semibold">Homework details</h1>
    {(await searchParams).created === "1" && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">Homework saved and assigned.</p>}
    <HomeworkSummary task={data.task} />
    {data.task.taskType && <p className="break-words text-sm text-slate-600">{data.task.taskType}</p>}
    <section className="space-y-3" aria-labelledby="assigned-heading">
      <h2 id="assigned-heading" className="text-lg font-semibold">Assigned students</h2>
      <p className="text-sm text-slate-600">{completed} / {data.assignments.length} completed · {data.assignments.length - completed} unresolved. Complete only after teacher verification.</p>
      {data.assignments.length ? <ul className="space-y-3">{data.assignments.map((assignment) => <StudentHomeworkRow key={assignment.id} assignment={assignment} />)}</ul> : <p>No students assigned to this task.</p>}
    </section>
  </div>;
}
