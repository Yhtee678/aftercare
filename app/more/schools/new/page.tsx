import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { SchoolForm } from "@/components/schools/school-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "添加学校" };

export default async function Page() {
  await connection();
  return <div className="max-w-2xl space-y-6">
    <h1 className="text-2xl font-semibold">添加学校</h1>
    <p className="text-sm text-slate-600">填写学校名称，新学校将默认启用。</p>
    <Card className="shadow-none"><CardContent><SchoolForm mode="create" submissionId={randomUUID()} /></CardContent></Card>
  </div>;
}
