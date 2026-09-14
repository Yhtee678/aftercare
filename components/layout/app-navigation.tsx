"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { navigationItems } from "./navigation";

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"}>
      <ul className={mobile ? "grid grid-cols-5 gap-1" : "space-y-1"}>
        {navigationItems.filter((item) => !mobile || item.mobile).map((item) => {
          const current = matches(item.href);
          const active = current || (item.href === "/more" && (matches("/dictation") || (mobile &&
            navigationItems.some((section) => !section.mobile && matches(section.href)))));
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link href={item.href} aria-current={current ? "page" : active ? "true" : undefined}
                className={cn(
                  "flex min-h-12 items-center rounded-xl font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
                  mobile ? "flex-col justify-center gap-1 px-1 py-2 text-[11px]" : "gap-3 px-3 py-3 text-sm",
                  active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}>
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
