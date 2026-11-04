import { requireUser } from "@/lib/auth";

/** Comprueba la sesión en el servidor antes de mostrar el contenido privado. */
export async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}

export function ContentFallback() {
  return (
    <div
      className="animate-pulse space-y-4 motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Cargando"
    >
      <div className="bg-surface-2 h-7 w-40 rounded-sm" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface-2 h-40 rounded-md" />
        ))}
      </div>
    </div>
  );
}
