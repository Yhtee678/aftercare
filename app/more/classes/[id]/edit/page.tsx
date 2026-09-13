import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { SchoolClassForm } from "@/components/classes/school-class-form";
import { ClassLoadError } from "@/components/classes/class-load-error";
import { Card, CardContent } from "@/components/ui/card";
import type { ActiveSchoolOption } from "@/db/queries/schools";

export const metadata: Metadata = { title: "Edit School Class" };

export default async function Page({ params }: PageProps<"/more/classes/[id]/edit">) {
  await connection();
  const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let item;
  let schools: ActiveSchoolOption[] = [];
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    item = await getSchoolClass(id);
    if (item) {
      const { getActiveSchools } = await import("@/db/queries/schools");
      schools = await getActiveSchools();
    }
  } catch {
    console.error("Edit School Class page: class or school query failed.");
    return <ClassLoadError retryHref={`/more/classes/${id}/edit`} />;
  }
  if (!item) notFound();
  const available = schools.some((school) => school.id === item.schoolId);
  return <div className="max-w-2xl space-y-6"><h1 className="text-2xl font-semibold">Edit School Class</h1>
    <p className="text-sm text-slate-600">Update the class details. Linked students will remain in this class.</p>
    <Card className="shadow-none"><CardContent>{schools.length ? <>
      {!available && <p role="status" className="mb-5 text-sm text-amber-800">The current school is inactive. Select an active school before saving.</p>}
      <SchoolClassForm mode="edit" id={item.id} schools={schools} initialValues={{ schoolId: available ? item.schoolId : "", academicYear: item.academicYear, grade: item.grade, className: item.className }} />
    </> : <div className="space-y-3"><p className="text-sm text-slate-600">No active schools are available. An active school is required before saving.</p><Link href={`/more/classes/${id}`} className="inline-flex min-h-12 items-center text-blue-700 underline">Back to class</Link></div>}
    </CardContent></Card>
  </div>;
}
