import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { DictationLoadError } from "@/components/dictation/dictation-load-error";

export const metadata: Metadata = { title: "Dictation" };

export default async function Page() {
  await connection();
  let classes;
  try {
    const { getDictationClasses } = await import("@/db/queries/dictation");
    classes = await getDictationClasses();
  } catch {
    console.error("Dictation grades: class query failed.");
    return <DictationLoadError />;
  }
  // Keep any historical grades outside the current form's 1–6 range reachable.
  const grades = [...new Set([1, 2, 3, 4, 5, 6, ...classes.map((item) => item.grade)])].sort((a, b) => a - b);
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-semibold">Dictation</h1><p className="mt-2 text-sm text-slate-600">Choose a grade, then a class. Task counts include all dates.</p></div>
      <Link href="/dictation/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white"><Plus className="size-4" aria-hidden="true" /> Add Dictation</Link>
    </div>
    <div className="space-y-3">{grades.map((grade) => {
      const items = classes.filter((item) => item.grade === grade);
      return <details key={grade} className="rounded-xl border border-slate-200 bg-white">
        <summary className="min-h-14 cursor-pointer rounded-xl px-4 py-4 font-semibold focus-visible:outline-2 focus-visible:outline-blue-700">Grade {grade} <span className="ml-2 text-sm font-normal text-slate-600">{items.length} {items.length === 1 ? "class" : "classes"}</span></summary>
        {items.length ? <ul className="grid gap-3 p-4 pt-0 sm:grid-cols-2">{items.map((item) => <li key={item.id}>
          <Link href={`/dictation/classes/${item.id}`} className="block space-y-2 rounded-lg border border-slate-200 p-4 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-blue-700">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words font-medium">{item.className}</span><span className="text-sm text-slate-600">{item.taskCount} {item.taskCount === 1 ? "task" : "tasks"}</span></div>
            <p className="break-words text-sm text-slate-600">{item.schoolName} · {item.academicYear}</p>
            {(item.status === "INACTIVE" || item.schoolStatus === "INACTIVE") && <p className="text-sm text-slate-500">{item.status === "INACTIVE" ? "Class inactive" : "School inactive"}</p>}
          </Link>
        </li>)}</ul> : <p className="px-4 pb-4 text-sm text-slate-600">No classes recorded for Grade {grade}.</p>}
      </details>;
    })}</div>
  </div>;
}
