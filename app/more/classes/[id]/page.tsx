import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pencil } from "lucide-react";
import { schoolClassIdSchema } from "@/lib/validation/school-class";
import { Card, CardContent } from "@/components/ui/card";
import { RecordStatus } from "@/components/record-status";
import { ClassLoadError } from "@/components/classes/class-load-error";
import { DeactivateSchoolClassForm } from "@/components/classes/deactivate-school-class-form";

export const metadata: Metadata = { title: "School class details" };

export default async function Page({ params, searchParams }: PageProps<"/more/classes/[id]">) {
  await connection();
  const { id } = await params;
  if (!schoolClassIdSchema.safeParse(id).success) notFound();
  let item;
  try {
    const { getSchoolClass } = await import("@/db/queries/school-classes");
    item = await getSchoolClass(id);
  } catch {
    console.error("Class detail: class query failed.");
    return <ClassLoadError retryHref={`/more/classes/${id}`} />;
  }
  if (!item) notFound();
  const notices = await searchParams;
  const message = notices.deactivated === "1" && item.status === "INACTIVE" ? "School class deactivated successfully."
    : notices.updated === "1" ? "School class updated successfully." : notices.created === "1" ? "School class added successfully." : null;
  return <div className="max-w-2xl space-y-6">
    <Link href="/more/classes" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Back to Classes</Link>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="min-w-0 break-words text-2xl font-semibold">{item.className}</h1>
      <Link href={`/more/classes/${id}/edit`} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2"><Pencil aria-hidden="true" className="size-4" /> Edit School Class</Link>
    </div>
    {message && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    {item.schoolStatus === "INACTIVE" && <p className="text-sm text-slate-600">School inactive — this class is unavailable for Student selection.</p>}
    <Card className="shadow-none"><CardContent><dl className="grid gap-5 sm:grid-cols-2">
      <div><dt className="text-sm text-slate-600">School</dt><dd className="mt-1 break-words">{item.schoolName}</dd></div>
      <div><dt className="text-sm text-slate-600">Class status</dt><dd className="mt-1"><RecordStatus status={item.status} /></dd></div>
      <div><dt className="text-sm text-slate-600">Academic year</dt><dd className="mt-1">{item.academicYear}</dd></div>
      <div><dt className="text-sm text-slate-600">Grade</dt><dd className="mt-1">{item.grade}</dd></div>
      {([["Created", item.createdAt], ["Last updated", item.updatedAt]] as const).map(([label, date]) => <div key={label}>
        <dt className="text-sm text-slate-600">{label} (UTC)</dt><dd className="mt-1"><time dateTime={date.toISOString()}>{date.toISOString().replace("T", " ").replace("Z", "")}</time></dd>
      </div>)}
    </dl></CardContent></Card>
    {item.status === "ACTIVE" && <DeactivateSchoolClassForm id={item.id} context={`${item.schoolName} · ${item.academicYear} · Grade ${item.grade} · ${item.className}`} />}
  </div>;
}
