import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { AppNavigation } from "./app-navigation";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <BookOpen aria-hidden="true" className="size-6 text-blue-700" />
      <div>
        <p className="text-base font-semibold tracking-tight text-slate-950">辅成托育管理</p>
        <p className="text-xs text-slate-500">每日托育</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <a href="#main-content" className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-white p-3 text-blue-700 focus:not-sr-only">
        跳至主要内容
      </a>
      <aside className="print:hidden fixed inset-y-0 left-0 hidden w-60 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="px-3 pb-8"><Brand /></div>
        <AppNavigation />
      </aside>
      <div className="md:pl-60 print:!pl-0">
        <header className="print:hidden flex min-h-20 items-center border-b border-slate-200 bg-white px-4 sm:px-6 md:px-8">
          <div className="md:hidden"><Brand /></div><Link href="/more" className="ml-auto inline-flex min-h-12 items-center px-3 text-sm text-blue-700 md:hidden">更多</Link>
          <p className="hidden text-sm font-medium text-slate-600 md:block">辅成托育管理</p>
        </header>
        <main id="main-content" tabIndex={-1} className="print:!max-w-none print:!p-0 mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
      <div className="print:hidden fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <AppNavigation mobile />
      </div>
    </div>
  );
}
