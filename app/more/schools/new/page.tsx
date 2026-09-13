import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { SchoolForm } from "@/components/schools/school-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Add School" };

export default async function Page() {
  await connection();
  return <div className="max-w-2xl space-y-6">
    <h1 className="text-2xl font-semibold">Add School</h1>
    <p className="text-sm text-slate-600">Enter the school name. New schools are active.</p>
    <Card className="shadow-none"><CardContent><SchoolForm mode="create" submissionId={randomUUID()} /></CardContent></Card>
  </div>;
}
