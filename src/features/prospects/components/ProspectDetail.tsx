import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Mail, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/dates";
import { getProspect, listInteractions, listProspectTasks } from "../queries";
import { INTERACTION_LABEL, LEGAL_BASIS_LABEL, SEGMENT_LABEL } from "../schema";
import { DeleteProspect } from "./DeleteProspect";
import { InteractionForm } from "./InteractionForm";
import { StageBadge } from "./StageBadge";
import { StageControl } from "./StageControl";
import { ConvertProspect } from "@/features/clients/components/ConvertProspect";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-strong text-right">{children}</dd>
    </div>
  );
}

export async function ProspectDetail({ id }: { id: string }) {
  const prospect = await getProspect(id);
  if (!prospect) notFound();
  const [interactions, tasks] = await Promise.all([listInteractions(id), listProspectTasks(id)]);
  const p = prospect;

  return (
    <>
      <div className="mb-2">
        <Link href="/crm/prospects" className="text-muted hover:text-strong">
          ← Prospects
        </Link>
      </div>
      <PageHeader
        title={p.full_name}
        description={[p.company_name, SEGMENT_LABEL[p.segment], p.municipality].filter(Boolean).join(" · ")}
        actions={
          <Link
            href={`/crm/prospects/${p.id}/editar`}
            className="border-border bg-surface-0 text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-4 font-semibold"
          >
            <Pencil className="size-4" aria-hidden />
            Editar
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <StageControl id={p.id} stage={p.stage} />
            <div className="flex flex-wrap gap-2">
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  className="border-border text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-semibold"
                >
                  <Phone className="size-4" aria-hidden />
                  Llamar
                </a>
              )}
              {p.phone && (
                <a
                  href={`https://wa.me/34${p.phone.replace(/\D/g, "").replace(/^34/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-semibold"
                >
                  WhatsApp
                </a>
              )}
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  className="border-border text-strong hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-semibold"
                >
                  <Mail className="size-4" aria-hidden />
                  Email
                </a>
              )}
            </div>
          </Card>

          {p.client ? (
            <Card className="border-success/30 bg-success/5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-success font-semibold">Ya es cliente.</span>
              <Link
                href={`/crm/clients/${p.client.id}`}
                className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-10 items-center rounded-sm px-4 font-semibold"
              >
                Ver cliente y pólizas
              </Link>
            </Card>
          ) : (
            p.stage !== "perdido" && (
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-body">
                  ¿Ha firmado? Conviértelo en cliente para registrar sus pólizas.
                </span>
                <ConvertProspect prospectId={p.id} name={p.full_name} />
              </Card>
            )
          )}

          <Card>
            <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Registrar un contacto</h2>
            <InteractionForm prospectId={p.id} />
          </Card>

          <Card>
            <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Historial</h2>
            {interactions.length === 0 ? (
              <p className="text-muted">Todavía no hay contactos registrados.</p>
            ) : (
              <ol className="border-border space-y-4 border-l pl-4">
                {interactions.map((i) => (
                  <li key={i.id} className="relative">
                    <span
                      className="rounded-pill bg-brand absolute top-1.5 -left-[21px] size-2.5"
                      aria-hidden
                    />
                    <div className="text-muted text-[13px]">
                      <span className="text-strong font-semibold">{INTERACTION_LABEL[i.kind]}</span> ·{" "}
                      {formatDateTime(i.occurred_at)}
                    </div>
                    {i.summary && <p className="mt-0.5 whitespace-pre-line">{i.summary}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-strong mb-1 text-base leading-6 font-semibold">Datos</h2>
            <dl className="divide-border divide-y">
              <Row label="Etapa">
                <StageBadge stage={p.stage} />
              </Row>
              {p.stage === "perdido" && p.lost_reason && <Row label="Motivo">{p.lost_reason}</Row>}
              {p.phone && <Row label="Teléfono">{p.phone}</Row>}
              {p.email && <Row label="Email">{p.email}</Row>}
              {(p.municipality || p.postal_code) && (
                <Row label="Zona">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="text-muted size-3.5" aria-hidden />
                    {[p.municipality, p.postal_code].filter(Boolean).join(" ")}
                  </span>
                </Row>
              )}
              {p.lead_source && <Row label="Origen">{p.lead_source.name}</Row>}
              {p.next_action_at && <Row label="Próximo paso">{formatDateTime(p.next_action_at)}</Row>}
              <Row label="Alta">{formatDateTime(p.created_at)}</Row>
            </dl>
            {p.notes && (
              <div className="bg-surface-1 mt-3 rounded-sm p-3">
                <div className="text-strong mb-1 text-[13px] font-semibold">Notas</div>
                <p className="whitespace-pre-line">{p.notes}</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Tareas</h2>
            {tasks.length === 0 ? (
              <p className="text-muted">Sin tareas.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    {t.done_at ? (
                      <CheckCircle2 className="text-success mt-0.5 size-4 shrink-0" aria-label="Hecha" />
                    ) : (
                      <Circle className="text-muted mt-0.5 size-4 shrink-0" aria-label="Pendiente" />
                    )}
                    <div>
                      <div className={t.done_at ? "text-muted line-through" : "text-strong"}>{t.title}</div>
                      {t.due_at && <div className="text-muted text-xs">{formatDateTime(t.due_at)}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="text-strong mb-2 flex items-center gap-2 text-base leading-6 font-semibold">
              <ShieldCheck className="text-muted size-4" aria-hidden />
              Protección de datos
            </h2>
            <dl className="divide-border divide-y">
              <Row label="Base legal">{LEGAL_BASIS_LABEL[p.legal_basis]}</Row>
              <Row label="Consentimiento">
                {p.consent_at ? `Sí · ${formatDateTime(p.consent_at)}` : "No registrado"}
              </Row>
              {p.consent_source && <Row label="Dónde">{p.consent_source}</Row>}
            </dl>
            <div className="mt-3">
              <DeleteProspect id={p.id} name={p.full_name} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function ProspectDetailFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="bg-surface-2 h-8 w-60 animate-pulse rounded-sm motion-reduce:animate-none" />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="bg-surface-2 h-96 animate-pulse rounded-md motion-reduce:animate-none" />
        <div className="bg-surface-2 h-96 animate-pulse rounded-md motion-reduce:animate-none" />
      </div>
    </div>
  );
}
