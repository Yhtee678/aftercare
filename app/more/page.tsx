import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, School, Users, BookOpen } from "lucide-react";
import { navigationItems } from "@/components/layout/navigation";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "更多" };

export default function Page() {
  return (
    <PlaceholderPage title="更多" description="日常工作所需的资料与报告。">
      <nav aria-label="更多功能" className="max-w-2xl">
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <li><Link href="/dictation" className="flex min-h-14 items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700"><BookOpen aria-hidden="true" className="size-5" /> 听写<ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" /></Link></li>
          <li>
            <Link href="/more/schools" className="flex min-h-14 items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700">
              <School aria-hidden="true" className="size-5" /> 学校
              <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" />
            </Link>
          </li>
          <li>
            <Link href="/more/classes" className="flex min-h-14 items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700">
              <Users aria-hidden="true" className="size-5" /> 班级
              <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" />
            </Link>
          </li>
          {navigationItems.filter((item) => item.href === "/students" || (!item.mobile && item.href !== "/dictation")).map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-14 items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700">
                <Icon aria-hidden="true" className="size-5" />
                {label}
                <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PlaceholderPage>
  );
}
