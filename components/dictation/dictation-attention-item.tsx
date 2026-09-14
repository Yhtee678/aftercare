import Link from "next/link";
import type { DictationAttention } from "@/db/queries/dictation";
import { dictationSourceLabels, dictationTypeLabels } from "@/lib/validation/dictation";
import { dictationDueLabel } from "@/lib/dictation-due";

export function DictationAttentionItem({ item, today }: { item: DictationAttention; today: string }) {
  return <li data-attention-id={item.id} className={`space-y-2 rounded-xl border p-4 ${item.scheduledDate <= today ? "border-red-200 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
    <h3 className="break-words font-semibold">{item.studentName} · {item.className}</h3>
    <p className="break-words text-sm text-slate-600">Grade {item.grade} · {item.schoolName} · {item.academicYear}</p>
    <p className="font-medium">{dictationSourceLabels[item.source]} · {dictationTypeLabels[item.type]} · {dictationDueLabel(item.scheduledDate, today, true)}</p>
    <p className="whitespace-pre-wrap break-words text-sm">{item.description}</p>
    <p className="text-sm">{item.status === "NEEDS_PRACTICE" ? "Needs Practice" : "Pending"} · Scheduled {item.scheduledDate}</p>
    <Link prefetch={false} href={`/dictation/${item.taskId}`} className="inline-flex min-h-12 items-center text-sm font-medium text-blue-700 underline">View Dictation</Link>
  </li>;
}
