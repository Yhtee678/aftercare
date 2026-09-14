import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { Card, CardContent } from "@/components/ui/card";
import { DictationSummary } from "@/components/dictation/dictation-summary";
import { DictationLoadError } from "@/components/dictation/dictation-load-error";

export const metadata: Metadata = { title: "Class Dictation" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let tasks;
  let schoolClass;
  let today;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    const { getDictationTasks } = await import("@/db/queries/dictation");
    const { getCareToday } = await import("@/db/queries/care");
    [schoolClass, tasks, today] = await Promise.all([getSchoolClass(id), getDictationTasks(id), getCareToday()]);
  } catch {
    console.error("Dictation list: query failed.");
    return <DictationLoadError href={`/dictation/classes/${id}`} />;
  }
  if (!schoolClass) notFound();
  return <div className="space-y-6">
    <Link href="/dictation" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Grades and Classes</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="break-words text-2xl font-semibold">{schoolClass.className} Dictation</h1>
        <p className="mt-2 break-words text-sm text-slate-600">{schoolClass.schoolName} · {schoolClass.academicYear} · Grade {schoolClass.grade}</p>
        <p className="mt-2 text-sm text-slate-600">Unresolved work first, earliest due dates first. All task dates included.</p>
      </div>
    </div>
    {schoolClass.status === "ACTIVE" && schoolClass.schoolStatus === "ACTIVE" && <Link href={`/dictation/new?classId=${id}`} className="inline-flex min-h-12 items-center rounded-lg bg-blue-700 px-4 text-white">Add Dictation</Link>}
    {(schoolClass.status === "INACTIVE" || schoolClass.schoolStatus === "INACTIVE") && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">{schoolClass.status === "INACTIVE" ? "Class inactive." : "School inactive."} Existing dictation remains available.</p>}
    {tasks.length ? <ul className="grid gap-3 sm:grid-cols-2">{tasks.map((task) => <li key={task.id}>
      <Link href={`/dictation/${task.id}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-blue-700">
        <Card className={`h-full shadow-none hover:border-blue-300 ${task.completed === task.total ? "bg-slate-50 text-slate-600" : ""}`}><CardContent className="space-y-4">
          <DictationSummary task={task} today={today} unresolved={task.completed < task.total} />
          <p className="text-sm">{task.completed} / {task.total} completed · {task.total - task.completed} unresolved</p>
          {task.corrections > 0 && <p className="rounded-md bg-amber-100 p-2 text-sm font-medium text-amber-900">{task.corrections} need practice</p>}
        </CardContent></Card>
      </Link>
    </li>)}</ul> : <p className="rounded-xl border bg-white p-6 text-slate-600">No dictation recorded for this class yet.</p>}
  </div>;
}
