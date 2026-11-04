"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { navItems, isActive } from "@/config/nav";
import { cn } from "@/lib/cn";

const primary = navItems.filter((i) => i.mobile);
const secondary = navItems.filter((i) => !i.mobile);

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = secondary.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-3 font-semibold";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Más secciones"
        >
          <button
            type="button"
            className="bg-strong/30 absolute inset-0"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="border-border bg-surface-0 absolute inset-x-0 bottom-0 rounded-t-md border-t p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-strong font-semibold">Más</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:bg-surface-2 flex size-9 items-center justify-center rounded-sm"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {secondary.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, href) ? "page" : undefined}
                    className={cn(
                      "border-border flex h-12 items-center gap-3 rounded-sm border px-3 font-semibold",
                      isActive(pathname, href) ? "bg-surface-2 text-strong" : "text-body",
                    )}
                  >
                    <Icon className="text-muted size-5" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <form action={signOut} className="mt-3">
              <button
                type="submit"
                className="border-border text-danger flex h-12 w-full items-center justify-center gap-2 rounded-sm border font-semibold"
              >
                <LogOut className="size-5" aria-hidden />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}

      <nav
        aria-label="Principal"
        className="border-border bg-surface-0 fixed inset-x-0 bottom-0 z-30 flex h-[calc(64px+env(safe-area-inset-bottom))] border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {primary.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(item, active ? "text-brand" : "text-muted")}
            >
              <Icon className="size-[22px]" aria-hidden />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className={cn(item, moreActive ? "text-brand" : "text-muted")}
        >
          <MoreHorizontal className="size-[22px]" aria-hidden />
          Más
        </button>
      </nav>
    </>
  );
}
