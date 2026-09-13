import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import Link from "next/link";
import { connection } from "next/server";
import { SchoolClassForm } from "@/components/classes/school-class-form";
import { ClassLoadError } from "@/components/classes/class-load-error";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Add School Class" };

export default async function Page() {
  await connection();
  let schools;
  try {
    const { getActiveSchools } = await import("@/db/queries/schools");
    schools = await getActiveSchools();
  } catch {
    console.error("Add School Class page: active school query failed.");
    return <ClassLoadError retryHref="/more/classes/new" />;
  }
  return <div className="max-w-2xl space-y-6"><h1 className="text-2xl font-semibold">Add School Class</h1>
    <p className="text-sm text-slate-600">Select an active school and enter the class details. New classes are active.</p>
    <Card className="shadow-none"><CardContent>{schools.length ? <SchoolClassForm mode="create" schools={schools} submissionId={randomUUID()}
      initialValues={{ schoolId: "", academicYear: new Date().getUTCFullYear(), grade: "", className: "" }} />
      : <div className="space-y-3"><p className="text-sm text-slate-600">No active schools are available. Add a school before creating a class.</p><Link href="/more/schools/new" className="inline-flex min-h-12 items-center text-blue-700 underline">Add School</Link></div>}
    </CardContent></Card>
  </div>;
}
