import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, School } from "lucide-react";
import { navigationItems } from "@/components/layout/navigation";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "More" };

export default function Page() {
  return (
    <PlaceholderPage title="More" description="Resources and reports for your daily work.">
      <nav aria-label="More sections" className="max-w-2xl">
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <li>
            <Link href="/more/schools" className="flex min-h-14 items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700">
              <School aria-hidden="true" className="size-5" /> Schools
              <ChevronRight aria-hidden="true" className="ml-auto size-4 text-slate-400" />
            </Link>
          </li>
          {navigationItems.filter((item) => !item.mobile).map(({ href, label, icon: Icon }) => (
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
