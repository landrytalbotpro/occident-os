import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { countByStage, listProspects } from "../queries";
import { SEGMENT_LABEL, STAGES, STAGE_LABEL, type Stage } from "../schema";
import { StageBadge } from "./StageBadge";

function hrefFor(stage?: Stage, q?: string) {
  const p = new URLSearchParams();
  if (stage) p.set("etapa", stage);
  if (q) p.set("q", q);
  const s = p.toString();
  return `/crm/prospects${s ? `?${s}` : ""}`;
}

export async function ProspectList({ stage, q }: { stage?: Stage; q?: string }) {
  const [items, counts] = await Promise.all([listProspects({ stage, q }), countByStage()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <form action="/crm/prospects" className="relative" role="search">
        {stage && <input type="hidden" name="etapa" value={stage} />}
        <Search
          className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <label htmlFor="q" className="sr-only">
          Buscar prospect
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

      <nav aria-label="Filtrar por etapa" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <ul className="flex w-max gap-2">
          {[undefined, ...STAGES].map((s) => {
            const active = s === stage;
            const n = s ? counts[s] : total;
            return (
              <li key={s ?? "todas"}>
                <Link
                  href={hrefFor(s, q)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-pill inline-flex h-8 items-center gap-1.5 border px-3 text-[13px] font-semibold whitespace-nowrap",
                    active
                      ? "border-brand bg-brand text-on-brand"
                      : "border-border bg-surface-0 text-body hover:bg-surface-2",
                  )}
                >
                  {s ? STAGE_LABEL[s] : "Todos"}
                  <span className={active ? "opacity-80" : "text-muted"}>{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {items.length === 0 ? (
        q || stage ? (
          <EmptyState
            icon={Search}
            title="Ningún prospect coincide"
            text="Prueba con otra búsqueda o quita el filtro."
            action={
              <Link href="/crm/prospects" className="text-strong font-semibold underline underline-offset-2">
                Ver todos
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Todavía no hay prospects"
            text="Añade a la primera persona o empresa con la que estás hablando."
          />
        )
      ) : (
        <Card className="p-0">
          <ul className="divide-border divide-y">
            {items.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/crm/prospects/${p.id}`}
                  className="hover:bg-surface-1 flex items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-strong truncate font-semibold">{p.full_name}</span>
                      <StageBadge stage={p.stage} />
                    </div>
                    <div className="text-muted mt-0.5 flex flex-wrap gap-x-3">
                      <span>{p.company_name ?? SEGMENT_LABEL[p.segment]}</span>
                      {p.municipality && <span>{p.municipality}</span>}
                      {p.lead_source && <span>{p.lead_source.name}</span>}
                      {p.next_action_at && <span>Próximo paso: {formatDateTime(p.next_action_at)}</span>}
                    </div>
                  </div>
                  <ChevronRight className="text-muted size-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function ProspectListFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando prospects">
      <div className="bg-surface-2 h-10 animate-pulse rounded-sm motion-reduce:animate-none" />
      <div className="rounded-pill bg-surface-2 h-8 w-2/3 animate-pulse motion-reduce:animate-none" />
      <div className="bg-surface-2 h-80 animate-pulse rounded-md motion-reduce:animate-none" />
    </div>
  );
}
