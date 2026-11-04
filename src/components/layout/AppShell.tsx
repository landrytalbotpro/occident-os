import { Suspense } from "react";
import { SidebarNav } from "./Sidebar";
import { TopbarTitle } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { UserMenu, UserMenuFallback } from "./UserMenu";
import { AuthGate, ContentFallback } from "./AuthGate";

function Wordmark() {
  return <span className="text-strong text-[15px] font-semibold tracking-wide">OCCIDENT OS</span>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* Sidebar escritorio */}
      <aside className="border-border bg-surface-0 fixed inset-y-0 left-0 hidden w-60 flex-col border-r lg:flex">
        <div className="flex h-14 items-center px-6">
          <Wordmark />
        </div>
        <Suspense>
          <SidebarNav />
        </Suspense>
        <p className="text-muted mt-auto px-6 py-4 text-xs leading-4">Herramienta interna del agente</p>
      </aside>

      <div className="lg:pl-60">
        <header className="border-border bg-surface-0/95 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:px-8">
          <span className="lg:hidden">
            <Wordmark />
          </span>
          <span className="hidden min-w-0 flex-1 lg:block">
            <Suspense>
              <TopbarTitle />
            </Suspense>
          </span>
          <div className="ml-auto">
            <Suspense fallback={<UserMenuFallback />}>
              <UserMenu />
            </Suspense>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 pt-6 pb-[calc(88px+env(safe-area-inset-bottom))] lg:px-8 lg:pb-10">
          <Suspense fallback={<ContentFallback />}>
            <AuthGate>{children}</AuthGate>
          </Suspense>
        </main>
      </div>

      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  );
}
