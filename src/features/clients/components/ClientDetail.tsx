import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { SEGMENT_LABEL } from "@/features/prospects/schema";
import { formatDate, formatDateTime, localDate } from "@/lib/dates";
import { formatEUR } from "@/lib/money";
import { getClient, listProducts } from "../queries";
import { LINE_LABEL, MIN_QUALIFYING_PREMIUM, PRODUCT_CATEGORY_LABEL } from "../schema";
import { PolicyForm } from "./PolicyForm";
import { PolicyStatusButton } from "./PolicyStatusButton";

export async function ClientDetail({ id }: { id: string }) {
  const [c, products] = await Promise.all([getClient(id), listProducts()]);
  if (!c) notFound();
  const active = c.policies.filter((p) => p.status === "emitida");
  const premium = active.reduce((a, p) => a + Number(p.annual_premium), 0);

  return (
    <>
      <div className="mb-2">
        <Link href="/crm/clients" className="text-muted hover:text-strong">
          ← Clientes
        </Link>
      </div>
      <PageHeader
        title={c.full_name}
        description={[c.company_name, SEGMENT_LABEL[c.segment], c.municipality].filter(Boolean).join(" · ")}
        actions={
          <div className="flex flex-wrap gap-2">
            {c.phone && (
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="border-border bg-surface-0 text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-semibold"
              >
                <Phone className="size-4" aria-hidden />
                Llamar
              </a>
            )}
            {c.email && (
              <a
                href={`mailto:${c.email}`}
                className="border-border bg-surface-0 text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-semibold"
              >
                <Mail className="size-4" aria-hidden />
                Email
              </a>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-0">
          <div className="border-border flex flex-wrap items-end justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-strong text-base leading-6 font-semibold">Pólizas</h2>
            <span className="text-muted">
              {active.length} activas · {formatEUR(premium)}/año
            </span>
          </div>
          {c.policies.length === 0 ? (
            <p className="text-muted px-4 py-6">Todavía no hay pólizas. Añade la primera a la derecha.</p>
          ) : (
            <ul className="divide-border divide-y">
              {c.policies.map((p) => {
                const counts = p.status === "emitida" && Number(p.annual_premium) > MIN_QUALIFYING_PREMIUM;
                return (
                  <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            p.status === "anulada"
                              ? "text-muted font-semibold line-through"
                              : "text-strong font-semibold"
                          }
                        >
                          {p.product.name}
                        </span>
                        <Badge tone="neutral">{LINE_LABEL[p.product.line]}</Badge>
                        {p.status === "anulada" && <Badge tone="danger">Anulada</Badge>}
                        {p.status === "emitida" && !counts && (
                          <Badge tone="warning">No cuenta (≤ {MIN_QUALIFYING_PREMIUM} €)</Badge>
                        )}
                      </div>
                      <div className="text-muted mt-0.5">
                        {PRODUCT_CATEGORY_LABEL[p.product.category] ?? p.product.category} · efecto{" "}
                        {formatDate(p.effective_date)}
                        {p.external_ref && ` · ref. ${p.external_ref}`}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-strong font-semibold tabular-nums">
                        {formatEUR(p.annual_premium)}
                      </span>
                      <PolicyStatusButton id={p.id} status={p.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Añadir póliza cerrada</h2>
            <PolicyForm clientId={c.id} products={products} today={localDate()} />
            <p className="text-muted mt-3 text-xs leading-4">
              Solo un resumen para tus objetivos. La gestión real de la póliza se hace en la plataforma de la
              entidad.
            </p>
          </Card>
          <Card>
            <h2 className="text-strong mb-1 text-base leading-6 font-semibold">Datos</h2>
            <dl className="divide-border divide-y">
              {c.phone && (
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-muted">Teléfono</dt>
                  <dd className="text-strong">{c.phone}</dd>
                </div>
              )}
              {c.email && (
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-muted">Email</dt>
                  <dd className="text-strong">{c.email}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-muted">Cliente desde</dt>
                <dd className="text-strong">{formatDateTime(c.created_at)}</dd>
              </div>
            </dl>
            {c.prospect_id && (
              <Link
                href={`/crm/prospects/${c.prospect_id}`}
                className="text-strong mt-3 inline-block font-semibold underline underline-offset-2"
              >
                Ver historial como prospect
              </Link>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export function ClientDetailFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="bg-surface-2 h-8 w-60 animate-pulse rounded-sm motion-reduce:animate-none" />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="bg-surface-2 h-80 animate-pulse rounded-md motion-reduce:animate-none" />
        <div className="bg-surface-2 h-80 animate-pulse rounded-md motion-reduce:animate-none" />
      </div>
    </div>
  );
}
