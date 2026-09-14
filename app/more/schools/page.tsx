import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SchoolStatus } from "@/components/schools/school-status";
import { SchoolLoadError } from "@/components/schools/school-load-error";

export const metadata: Metadata = { title: "学校" };

export default async function Page() {
  await connection();
  let schools;
  try {
    const { getSchools } = await import("@/db/queries/schools");
    schools = await getSchools();
  } catch {
    console.error("Schools page: school list query failed.");
    return <SchoolLoadError retryHref="/more/schools" />;
  }
  return <div className="space-y-6">
    <Link href="/more" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">返回更多</Link>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2"><h1 className="text-2xl font-semibold">学校</h1><p className="text-sm text-slate-600">查看学校及启用状态。</p></div>
      <Link href="/more/schools/new" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2"><Plus aria-hidden="true" className="size-4" /> 添加学校</Link>
    </div>
    {schools.length ? <ul className="grid gap-3 sm:grid-cols-2">
      {schools.map((school) => <li key={school.id}>
        <Link href={`/more/schools/${school.id}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          <Card className="h-full shadow-none hover:border-blue-300"><CardContent className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 break-words text-base font-medium">{school.name}</h2><SchoolStatus status={school.status} />
          </CardContent></Card>
        </Link>
      </li>)}
    </ul> : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">暂无学校，请先添加学校。</p>}
  </div>;
}
