import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { dictationIdSchema } from "@/lib/validation/dictation";
import { DictationSummary } from "@/components/dictation/dictation-summary";
import { DictationLoadError } from "@/components/dictation/dictation-load-error";
import { StudentDictationRow } from "@/components/dictation/student-dictation-row";

export const metadata: Metadata = { title: "Dictation details" };
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
  const completed = data.assignments.filter((item) => item.status === "COMPLETED").length;
  return <div className="max-w-2xl space-y-6">
    <Link href={data.task.schoolClassId ? `/dictation/classes/${data.task.schoolClassId}` : "/dictation"} className="inline-flex min-h-12 items-center text-blue-700 underline">{data.task.schoolClassId ? "Back to Class Dictation" : "Back to Dictation"}</Link>
    <h1 className="text-2xl font-semibold">Dictation details</h1>
    {(await searchParams).created === "1" && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">Dictation saved and assigned.</p>}
    <DictationSummary task={data.task} today={today} unresolved={completed < data.assignments.length} />
    <section className="space-y-3" aria-labelledby="assigned-heading">
      <h2 id="assigned-heading" className="text-lg font-semibold">Assigned students</h2>
      <p className="text-sm text-slate-600">{completed} / {data.assignments.length} completed · {data.assignments.length - completed} unresolved. Complete only after teacher verification.</p>
      {data.assignments.length ? <ul className="space-y-3">{data.assignments.map((assignment) => <StudentDictationRow key={assignment.id} assignment={assignment} />)}</ul> : <p>No students assigned to this task.</p>}
    </section>
  </div>;
}
