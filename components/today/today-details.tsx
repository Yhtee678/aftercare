import { homeworkTitle } from "@/lib/homework-title";
import Link from "next/link";
import { formatGrade } from "@/lib/ui-labels";
import { formatCareTime } from "@/lib/care-date";
import { DictationAttentionItem } from "@/components/dictation/dictation-attention-item";
import type { getTodayOverview } from "@/db/queries/today";
export type TodayData = Awaited<ReturnType<typeof getTodayOverview>>;
export function TodayDetails({ data }: { data: TodayData }) {
  const grades = [...new Set(data.classes.map((item) => item.grade))];
  return <div className="space-y-8">
    <p className="text-sm text-slate-600">{data.today} · 马来西亚时间</p>
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">今日</h1><p className="mt-2 text-sm text-slate-600">{data.today} · 马来西亚时间</p></div><a href="/today" className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">刷新今日</a></header>
    <details className="space-y-3 rounded-xl border border-amber-200 p-4">
      <summary id="attention-heading" className="min-h-12 cursor-pointer py-3 text-lg font-semibold">需要注意 · {data.dueDictations.length + data.corrections.length + data.nextDictations.length + data.bags.length} 项</summary>
      <p className="text-sm text-slate-600">依次显示今日及逾期听写、功课订正、明日听写，以及尚未检查的书包。</p>
      {!data.dueDictations.length && !data.nextDictations.length && !data.corrections.length && !data.bags.length ? <p className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-800">目前没有需要处理的事项。</p>
        : <ul className="grid gap-3 sm:grid-cols-2">
          {data.dueDictations.map((item) => <DictationAttentionItem key={`dictation:${item.id}`} item={item} today={data.today} />)}
          {data.corrections.map((item) => <li key={`correction:${item.id}`} data-attention-id={item.id} className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <h3 className="break-words font-semibold">{item.studentName}</h3>
            <p className="break-words text-sm text-slate-600">{item.schoolName} · {item.className}</p>
            <p className="font-medium text-amber-900">功课需要订正</p>
            <p className="whitespace-pre-wrap break-words text-sm">{homeworkTitle(item.subject, item.taskType)} — {item.description}{item.pageFrom !== null && ` · 页数 ${item.pageFrom}${item.pageTo !== null && item.pageTo !== item.pageFrom ? `–${item.pageTo}` : ""}`}</p>
            <p className="text-xs text-slate-600">功课日期： {item.taskDate}</p>
            <Link prefetch={false} href={`/homework/${item.taskId}`} className="inline-flex min-h-12 items-center text-sm font-medium text-blue-700 underline">查看功课</Link>
          </li>)}
          {data.nextDictations.map((item) => <DictationAttentionItem key={`dictation:${item.id}`} item={item} today={data.today} />)}
          {data.bags.map((item) => <li key={`bag:${item.id}`} data-attention-id={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="break-words font-semibold">{item.studentName}</h3>
            <p className="break-words text-sm text-slate-600">{item.schoolName} · {item.className}</p>
            <p className="font-medium">书包尚未检查</p><p className="text-sm text-slate-600">已到班 {formatCareTime(item.arrivalTime)}</p>
            <Link prefetch={false} href={`/care/classes/${item.classId}`} className="inline-flex min-h-12 items-center text-sm font-medium text-blue-700 underline">打开托育</Link>
          </li>)}
        </ul>}
    </details>
    <section className="space-y-4" aria-labelledby="classes-heading"><h2 id="classes-heading" className="text-xl font-semibold">班级概况</h2>
      <p className="text-sm text-slate-600">托育与功课数量按今日计算。注意事项包括过往未订正功课，以及明天或之前到期的未完成听写；一名学生可能有多项。</p>
      {grades.map((grade) => <div key={grade} className="space-y-3"><h3 className="font-semibold">{formatGrade(grade)}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">{data.classes.filter((item) => item.grade === grade).map((item) => <li key={item.id} data-class-id={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="break-words font-semibold"><Link href={`/today/classes/${item.id}`} className="inline-flex min-h-12 items-center text-blue-700 underline">{item.schoolName} · {item.className}</Link></h4>
          <p className="text-sm">{item.activeStudents} 名启用学生 · {item.arrived} 人已到班 · {item.bagsChecked} 人已检查书包</p>
          {item.homeworkTotal > 0 && <p className="text-sm">功课： {item.homeworkCompleted} / {item.homeworkTotal} 已完成</p>}
          {item.dictationCount > 0 && <p className="text-sm">{item.dictationCount} 项未完成听写（明天或之前到期）</p>}
          <p className={`text-sm ${item.attentionCount ? "font-medium text-amber-900" : "text-slate-600"}`}>{item.attentionCount} 项需要注意</p>
          <div className="flex gap-5"><Link prefetch={false} href={`/care/classes/${item.id}`} className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">打开托育</Link><Link prefetch={false} href={`/homework/classes/${item.id}`} className="inline-flex min-h-12 items-center text-sm text-blue-700 underline">功课</Link></div>
        </li>)}</ul>
      </div>)}
      {!grades.length && <p className="text-sm text-slate-600">暂无有学生或任务的启用班级。</p>}
    </section>
  </div>;
}
