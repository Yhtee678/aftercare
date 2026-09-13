import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecordStatus } from "@/components/record-status";
import { ClassLoadError } from "@/components/classes/class-load-error";

export const metadata: Metadata = { title: "Classes" };

export default async function Page() {
  await connection();
  let classes;
  try {
    const { getSchoolClasses } = await import("@/db/queries/school-classes");
    classes = await getSchoolClasses();
  } catch {
    console.error("Classes page: class list query failed.");
    return <ClassLoadError retryHref="/more/classes" />;
  }
  return <div className="space-y-6">
    <Link href="/more" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Back to More</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2"><h1 className="text-2xl font-semibold">Classes</h1><p className="text-sm text-slate-600">School classes and their current status.</p></div>
      <Link href="/more/classes/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2"><Plus aria-hidden="true" className="size-4" /> Add School Class</Link>
    </div>
    {classes.length ? <ul className="grid gap-3 sm:grid-cols-2">{classes.map((item) => <li key={item.id}>
      <Link href={`/more/classes/${item.id}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
        <Card className="h-full shadow-none hover:border-blue-300"><CardContent className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="min-w-0 break-words font-medium">{item.className}</h2><RecordStatus status={item.status} /></div>
          <p className="break-words text-sm text-slate-600">{item.schoolName}</p>
          <p className="text-sm text-slate-600">{item.academicYear} · Grade {item.grade}</p>
          {item.schoolStatus === "INACTIVE" && <p className="text-sm text-slate-600">School inactive — unavailable for Student selection.</p>}
        </CardContent></Card>
      </Link>
    </li>)}</ul> : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No school classes recorded yet.</p>}
  </div>;
}
