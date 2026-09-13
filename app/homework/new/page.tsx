import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { HomeworkForm } from "@/components/homework/homework-form";
import { HomeworkLoadError } from "@/components/homework/homework-load-error";

export const metadata: Metadata = { title: "Add Homework" };
export default async function Page() {
  await connection();
  let classes;
  try {
    const { getActiveSchoolClasses } = await import("@/db/queries/school-classes");
    classes = await getActiveSchoolClasses();
  } catch {
    console.error("Add Homework: class query failed.");
    return <HomeworkLoadError href="/homework/new" />;
  }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <div className="max-w-2xl space-y-6">
    <Link href="/homework" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Homework</Link>
    <h1 className="text-2xl font-semibold">Add Homework</h1>
    {classes.length ? <HomeworkForm classes={classes} submissionId={randomUUID()} today={today} />
      : <p>No active classes are available. Add an active school and class in More before creating homework.</p>}
  </div>;
}
