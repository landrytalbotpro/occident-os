"use client";

import { usePathname } from "next/navigation";
import { titleFor } from "@/config/nav";

export function TopbarTitle() {
  const pathname = usePathname();
  return <span className="text-strong truncate text-[15px] font-semibold">{titleFor(pathname)}</span>;
}
