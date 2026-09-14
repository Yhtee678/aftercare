import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { formatCareTime } from "@/lib/care-date";
import { DictationAttentionItem } from "@/components/dictation/dictation-attention-item";

export const metadata: Metadata = { title: "Today" };

export default async function Page() {
  await connection();
  let data;
  try {
    const { getTodayOverview } = await import("@/db/queries/today");
    data = await getTodayOverview();
  } catch {
    console.error("Today: attention queries failed.");
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">Today</h1><p role="alert">Unable to load today’s work. Please try again.</p><a href="/today" className="inline-flex min-h-12 items-center text-blue-700 underline">Retry Today</a></div>;
  }
  const grades = [...new Set(data.classes.map((item) => item.grade))];
  return <div className="space-y-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Today</h1><p className="mt-2 text-sm text-slate-600">{data.today} · Malaysia time</p></div><a href="/today" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Refresh Today</a></header>
    <section className="space-y-3" aria-labelledby="attention-heading">
      <h2 id="attention-heading" className="text-xl font-semibold">Needs Attention</h2>
      <p className="text-sm text-slate-600">Due/overdue Dictation, Homework corrections, tomorrow’s Dictation, then unchecked bags.</p>
      {!data.dueDictations.length && !data.nextDictations.length && !data.corrections.length && !data.bags.length ? <p className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-800">No urgent items right now.</p>
        : <ul className="grid gap-3 sm:grid-cols-2">
          {data.dueDictations.map((item) => <DictationAttentionItem key={`dictation:${item.id}`} item={item} today={data.today} />)}
          {data.corrections.map((item) => <li key={`correction:${item.id}`} data-attention-id={item.id} className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <h3 className="break-words font-semibold">{item.studentName} · {item.className}</h3>
            <p className="break-words text-sm text-slate-600">Grade {item.grade} · {item.schoolName} · {item.academicYear}</p>
            <p className="font-medium text-amber-900">Homework needs correction</p>
            <p className="whitespace-pre-wrap break-words text-sm">{item.subject} — {item.description}{item.pageFrom !== null && ` · Pg ${item.pageFrom}${item.pageTo !== null && item.pageTo !== item.pageFrom ? `–${item.pageTo}` : ""}`}</p>
            <p className="text-xs text-slate-600">Task date: {item.taskDate}</p>
            <Link prefetch={false} href={`/homework/${item.taskId}`} className="inline-flex min-h-12 items-center text-sm font-medium text-blue-700 underline">View Homework</Link>
          </li>)}
          {data.nextDictations.map((item) => <DictationAttentionItem key={`dictation:${item.id}`} item={item} today={data.today} />)}
          {data.bags.map((item) => <li key={`bag:${item.id}`} data-attention-id={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="break-words font-semibold">{item.studentName} · {item.className}</h3>
            <p className="break-words text-sm text-slate-600">Grade {item.grade} · {item.schoolName} · {item.academicYear}</p>
            <p className="font-medium">Bag not checked</p><p className="text-sm text-slate-600">Arrived {formatCareTime(item.arrivalTime)}</p>
            <Link prefetch={false} href={`/care/classes/${item.classId}`} className="inline-flex min-h-12 items-center text-sm font-medium text-blue-700 underline">Open Care</Link>
          </li>)}
        </ul>}
    </section>
    <section className="space-y-4" aria-labelledby="classes-heading"><h2 id="classes-heading" className="text-xl font-semibold">Class Overview</h2>
      <p className="text-sm text-slate-600">Care and homework counts are for today. Attention includes older corrections and unresolved Dictation due through tomorrow; one student may have several items.</p>
      {grades.map((grade) => <div key={grade} className="space-y-3"><h3 className="font-semibold">Grade {grade}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">{data.classes.filter((item) => item.grade === grade).map((item) => <li key={item.id} data-class-id={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="break-words font-semibold">{item.className}</h4><p className="break-words text-sm text-slate-600">{item.schoolName} · {item.academicYear}</p>
          <p className="text-sm">{item.activeStudents} active students · {item.arrived} arrived · {item.bagsChecked} bags checked</p>
          {item.homeworkTotal > 0 && <p className="text-sm">Homework: {item.homeworkCompleted} / {item.homeworkTotal} completed</p>}
          {item.dictationCount > 0 && <p className="text-sm">{item.dictationCount} unresolved Dictation due through tomorrow</p>}
          <p className={`text-sm ${item.attentionCount ? "font-medium text-amber-900" : "text-slate-600"}`}>{item.attentionCount} attention items</p>
          <div className="flex gap-5"><Link prefetch={false} href={`/care/classes/${item.id}`} className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Open Care</Link><Link prefetch={false} href={`/homework/classes/${item.id}`} className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">Homework</Link></div>
        </li>)}</ul>
      </div>)}
      {!grades.length && <p className="text-sm text-slate-600">No active classes with students or homework to show.</p>}
    </section>
  </div>;
}
