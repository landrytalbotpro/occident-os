import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/features/auth/actions";

export async function UserMenu() {
  const user = await requireUser();
  const initial = user.email.charAt(0).toUpperCase() || "·";
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted hidden max-w-56 truncate sm:inline" title={user.email}>
        {user.email}
      </span>
      <div
        className="rounded-pill bg-surface-2 text-strong flex size-8 items-center justify-center text-xs font-semibold"
        aria-hidden
      >
        {initial}
      </div>
      <form action={signOut} className="hidden lg:block">
        <button
          type="submit"
          className="text-muted hover:bg-surface-2 hover:text-strong flex h-8 items-center gap-1.5 rounded-sm px-2 font-semibold"
        >
          <LogOut className="size-4" aria-hidden />
          Salir
        </button>
      </form>
    </div>
  );
}

export function UserMenuFallback() {
  return (
    <div className="rounded-pill bg-surface-2 size-8 animate-pulse motion-reduce:animate-none" aria-hidden />
  );
}
