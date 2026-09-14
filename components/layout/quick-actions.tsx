"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
export function QuickActions() {
  const [open, setOpen] = useState(false);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger aria-label="快捷新增" className="flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-xl bg-blue-700 py-2 text-xs text-white"><Plus aria-hidden="true" className="size-5" />新增</SheetTrigger><SheetContent side="bottom" className="rounded-t-xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"><SheetTitle>快捷新增</SheetTitle><SheetDescription>选择要分配的任务</SheetDescription>{[["/homework/new", "新增功课"], ["/dictation/new", "新增听写"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-14 items-center rounded-lg border px-4 text-base font-medium text-blue-700">{label}</Link>)}</SheetContent></Sheet>;
}
