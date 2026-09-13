import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pencil } from "lucide-react";
import { schoolIdSchema } from "@/lib/validation/school";
import { Card, CardContent } from "@/components/ui/card";
import { SchoolStatus } from "@/components/schools/school-status";
import { SchoolLoadError } from "@/components/schools/school-load-error";
import { DeactivateSchoolForm } from "@/components/schools/deactivate-school-form";

export const metadata: Metadata = { title: "School details" };

export default async function Page({ params, searchParams }: PageProps<"/more/schools/[id]">) {
  await connection();
  const { id } = await params;
  if (!schoolIdSchema.safeParse(id).success) notFound();
  let school;
  try {
    const { getSchool } = await import("@/db/queries/schools");
    school = await getSchool(id);
  } catch {
    console.error("School detail: school query failed.");
    return <SchoolLoadError retryHref={`/more/schools/${id}`} />;
  }
  if (!school) notFound();
  const notices = await searchParams;
  const message = notices.deactivated === "1" && school.status === "INACTIVE" ? "School deactivated successfully."
    : notices.updated === "1" ? "School updated successfully." : notices.created === "1" ? "School added successfully." : null;
  return <div className="max-w-2xl space-y-6">
    <Link href="/more/schools" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Back to Schools</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="min-w-0 break-words text-2xl font-semibold">{school.name}</h1>
      <Link href={`/more/schools/${id}/edit`} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2"><Pencil aria-hidden="true" className="size-4" /> Edit School</Link>
    </div>
    {message && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    <Card className="shadow-none"><CardContent><dl className="space-y-5">
      <div><dt className="text-sm text-slate-600">Status</dt><dd className="mt-1"><SchoolStatus status={school.status} /></dd></div>
      {([["Created", school.createdAt], ["Last updated", school.updatedAt]] as const).map(([label, date]) => <div key={label}>
        <dt className="text-sm text-slate-600">{label} (UTC)</dt><dd className="mt-1"><time dateTime={date.toISOString()}>{date.toISOString().replace("T", " ").replace("Z", "")}</time></dd>
      </div>)}
    </dl></CardContent></Card>
    {school.status === "ACTIVE" && <DeactivateSchoolForm id={school.id} name={school.name} />}
  </div>;
}
