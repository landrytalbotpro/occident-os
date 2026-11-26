import Link from "next/link";
import { CalendarClock, MessageCircle, Phone } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/dates";
import { DUE_WINDOW_DAYS } from "../occurrence";
import { getDueRenewals } from "../queries";
import { monthLabel } from "../schema";
import { HandledButton } from "./HandledButton";

const iconLink =
  "border-border text-strong hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-sm border";

function daysLabel(days: number) {
  if (days < 0) return "Este mes";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `${days} días`;
}

/** KPI del inicio: cuántos vencimientos hay que llamar en los próximos 90 días. */
export async function DueRenewalsKpi() {
  const items = await getDueRenewals();
  const soon = items.filter((r) => r.daysUntil <= 30).length;
  return (
    <Card className="flex flex-col">
      <div className="bg-warning/10 flex size-9 items-center justify-center rounded-sm">
        <CalendarClock className="text-warning size-5" aria-hidden />
      </div>
      <div className="text-strong mt-3 text-[13px] leading-4 font-semibold">
        Vencimientos {DUE_WINDOW_DAYS} días
      </div>
      <div className="text-muted text-xs leading-4">sin llamar todavía</div>
      <div className="text-strong mt-2 text-[28px] leading-8 font-semibold">{items.length}</div>
      <div className="text-muted mt-1.5 text-xs leading-4">
        {soon === 0 ? "Ninguno en los próximos 30 días" : `${soon} en los próximos 30 días`}
      </div>
    </Card>
  );
}

/** Tarjeta «A llamar · próximos 90 días». */
export async function DueRenewals() {
  const items = await getDueRenewals();
  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nadie a quien llamar por vencimientos"
        text="Registra en cada ficha el mes en que vencen sus seguros y aparecerán aquí 90 días antes."
      />
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-border divide-y">
        {items.map((r) => {
          const phone = r.phone?.replace(/\s/g, "");
          const wa = r.phone?.replace(/\D/g, "").replace(/^34/, "");
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 basis-48">
                <Link href={r.href} className="text-strong font-semibold underline-offset-2 hover:underline">
                  {r.name}
                </Link>
                <div className="text-muted flex flex-wrap items-center gap-x-2">
                  <span>
                    {r.product} · {monthLabel(r.month)}
                  </span>
                  <Badge tone={r.daysUntil <= 30 ? "warning" : "neutral"}>
                    <span className="sr-only">Vence el {formatDate(r.occurrenceDate)}: </span>
                    {daysLabel(r.daysUntil)}
                  </Badge>
                </div>
                {r.note && <p className="text-muted mt-0.5 text-[13px] break-words">{r.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className={iconLink}
                    aria-label={`Llamar a ${r.name}`}
                    title="Llamar"
                  >
                    <Phone className="size-4" aria-hidden />
                  </a>
                )}
                {wa && (
                  <a
                    href={`https://wa.me/34${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconLink}
                    aria-label={`WhatsApp a ${r.name}`}
                    title="WhatsApp"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </a>
                )}
                <HandledButton id={r.id} label={`${r.name}, ${r.product}`} />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function DueRenewalsKpiFallback() {
  return (
    <div className="bg-surface-2 h-44 animate-pulse rounded-md motion-reduce:animate-none" aria-busy="true" />
  );
}
