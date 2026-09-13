import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { schoolIdSchema } from "@/lib/validation/school";
import { SchoolForm } from "@/components/schools/school-form";
import { SchoolLoadError } from "@/components/schools/school-load-error";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Edit School" };

export default async function Page({ params }: PageProps<"/more/schools/[id]/edit">) {
  await connection();
  const { id } = await params;
  if (!schoolIdSchema.safeParse(id).success) notFound();
  let school;
  try {
    const { getSchool } = await import("@/db/queries/schools");
    school = await getSchool(id);
  } catch {
    console.error("Edit School page: school query failed.");
    return <SchoolLoadError retryHref={`/more/schools/${id}/edit`} />;
  }
  if (!school) notFound();
  return <div className="max-w-2xl space-y-6">
    <h1 className="text-2xl font-semibold">Edit School</h1>
    <p className="text-sm text-slate-600">Update the school name.</p>
    <Card className="shadow-none"><CardContent><SchoolForm mode="edit" id={school.id} name={school.name} /></CardContent></Card>
  </div>;
}
