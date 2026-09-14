"use client";

import { useRef, useState, useTransition } from "react";
import { changeDictationStatus } from "@/app/dictation/actions";
import { Button } from "@/components/ui/button";
import type { DictationStatus } from "@/lib/validation/dictation";

export function StudentDictationRow({ assignment }: { assignment: { id: string; studentName: string; status: DictationStatus } }) {
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const completed = assignment.status === "COMPLETED";
  const correction = assignment.status === "NEEDS_PRACTICE";
  const change = (status: "COMPLETED" | "NEEDS_PRACTICE") => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = await changeDictationStatus({ id: assignment.id, status });
        setMessage(result.success ? { error: false, text: status === "COMPLETED" ? "已标记完成。" : "已记录需要练习/订正。" } : { error: true, text: result.message });
      } catch { setMessage({ error: true, text: "暂时无法确认更新结果，请刷新查看状态。" }); }
      finally { busy.current = false; }
    });
  };
  return <li className={`space-y-3 rounded-xl border p-4 ${completed ? "border-slate-200 bg-slate-50 text-slate-600" : correction ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-medium">{assignment.studentName}</h3>
      <span className={`text-sm font-medium ${correction ? "text-amber-900" : completed ? "text-green-800" : "text-slate-600"}`}>{completed ? "已完成" : correction ? "需要练习/订正" : "未完成"}</span>
    </div>
    {!completed && <div className="flex flex-wrap gap-2">
      <Button disabled={pending} onClick={() => change("COMPLETED")} className="min-h-12 bg-blue-700 px-5 text-white hover:bg-blue-800">{pending ? "正在保存…" : "完成"}</Button>
      {!correction && <Button disabled={pending} onClick={() => change("NEEDS_PRACTICE")} variant="outline" className="min-h-12 border-amber-400 text-amber-900">需要练习/订正</Button>}
    </div>}
    {message && <p role={message.error ? "alert" : "status"} className={`text-sm ${message.error ? "text-red-700" : "text-slate-600"}`}>{message.text}</p>}
  </li>;
}
