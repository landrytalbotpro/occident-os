import Link from "next/link";
import { ChevronRight, Search, UserCheck } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { SEGMENT_LABEL } from "@/features/prospects/schema";
import { formatEUR } from "@/lib/money";
import { listClients } from "../queries";

export async function ClientList({ q }: { q?: string }) {
  const items = await listClients(q);
  return (
    <div className="space-y-4">
      <form action="/crm/clients" className="relative" role="search">
        <Search
          className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <label htmlFor="q" className="sr-only">
          Buscar cliente
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por nombre, empresa o municipio"
          className="border-border bg-surface-0 text-strong placeholder:text-muted h-10 w-full rounded-sm border pr-3 pl-9 text-sm"
        />
      </form>

      {items.length === 0 ? (
        q ? (
          <EmptyState icon={Search} title="Ningún cliente coincide" text="Prueba con otra búsqueda." />
        ) : (
          <EmptyState
            icon={UserCheck}
            title="Todavía no hay clientes"
            text="Un prospect pasa a cliente cuando lo conviertes desde su ficha."
          />
        )
      ) : (
        <Card className="p-0">
          <ul className="divide-border divide-y">
            {items.map((c) => {
              const active = c.policies.filter((p) => p.status === "emitida");
              const premium = active.reduce((a, p) => a + Number(p.annual_premium), 0);
              return (
                <li key={c.id}>
                  <Link
                    href={`/crm/clients/${c.id}`}
                    className="hover:bg-surface-1 flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-strong truncate font-semibold">{c.full_name}</div>
                      <div className="text-muted mt-0.5 flex flex-wrap gap-x-3">
                        <span>{c.company_name ?? SEGMENT_LABEL[c.segment]}</span>
                        {c.municipality && <span>{c.municipality}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-strong font-semibold">
                        {active.length} {active.length === 1 ? "póliza" : "pólizas"}
                      </div>
                      <div className="text-muted">{formatEUR(premium)}/año</div>
                    </div>
                    <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
