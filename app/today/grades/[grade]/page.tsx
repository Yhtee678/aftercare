import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { formatGrade } from "@/lib/ui-labels";
import { TodayDetails } from "@/components/today/today-details";
export const metadata = { title: "年级今日概况" };
export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  await connection(); const { grade } = await params;
  if (!/^[1-6]$/.test(grade) && grade !== "other") notFound();
  let data;
  try { const { getTodayOverview } = await import("@/db/queries/today"); data = await getTodayOverview(); }
  catch { return <p role="alert">暂时无法加载年级事项，请刷新重试。</p>; }
  const matches = (item: { grade: number }) => grade === "other" ? item.grade < 1 || item.grade > 6 : item.grade === Number(grade);
  return <div className="space-y-6"><Link href="/today" className="inline-flex min-h-12 items-center text-blue-700 underline">返回今日</Link><h1 className="text-2xl font-semibold">{grade === "other" ? "其他年级" : formatGrade(Number(grade))} · 今日</h1><TodayDetails data={{ ...data, classes: data.classes.filter(matches), dueDictations: data.dueDictations.filter(matches), nextDictations: data.nextDictations.filter(matches), corrections: data.corrections.filter(matches), bags: data.bags.filter(matches) }} /></div>;
}
