"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, isActive } from "@/config/nav";
import { cn } from "@/lib/cn";

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-0.5 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-9 items-center gap-3 rounded-sm px-3 font-semibold transition-colors",
              active ? "bg-surface-2 text-strong" : "text-muted hover:bg-surface-2 hover:text-strong",
            )}
          >
            {active && <span className="rounded-pill bg-brand absolute inset-y-2 left-0 w-0.5" aria-hidden />}
            <Icon className={cn("size-[18px]", active && "text-brand")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
