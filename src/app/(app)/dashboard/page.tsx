import type { Metadata } from "next";
import {
  CalendarDays,
  CheckSquare,
  FileCheck2,
  Shield,
  Home,
  HeartPulse,
  HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Inicio" };

// Estructura del dashboard. Los objetivos vendrán de `targets` y los resultados de la vista mensual (etapa 3).
// VALORES FICTICIOS de ejemplo para ver las barras.
type Kpi = {
  label: string;
  hint?: string;
  value: number;
  target: number;
  icon: LucideIcon;
  /** Clases de color de la categoría (tokens --cat-*) */
  bar: string;
  text: string;
  tint: string;
};

const kpis: Kpi[] = [
  {
    label: "Pólizas",
    value: 9,
    target: 42,
    icon: FileCheck2,
    bar: "bg-cat-total",
    text: "text-cat-total",
    tint: "bg-cat-total/10",
  },
  {
    label: "Seguros generales",
    value: 4,
    target: 12,
    icon: Shield,
    bar: "bg-cat-ssgg",
    text: "text-cat-ssgg",
    tint: "bg-cat-ssgg/10",
  },
  {
    label: "Hogar",
    hint: "dentro de SSGG",
    value: 2,
    target: 6,
    icon: Home,
    bar: "bg-cat-hogar",
    text: "text-cat-hogar",
    tint: "bg-cat-hogar/10",
  },
  {
    label: "Vida",
    value: 3,
    target: 12,
    icon: HeartPulse,
    bar: "bg-cat-vida",
    text: "text-cat-vida",
    tint: "bg-cat-vida/10",
  },
  {
    label: "Vida riesgo",
    hint: "dentro de Vida",
    value: 6,
    target: 6,
    icon: HeartHandshake,
    bar: "bg-cat-vida-riesgo",
    text: "text-cat-vida-riesgo",
    tint: "bg-cat-vida-riesgo/10",
  },
];

function KpiCard({ label, hint, value, target, icon: Icon, bar, text, tint }: Kpi) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const done = value >= target;
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex size-9 items-center justify-center rounded-sm", tint)}>
          <Icon className={cn("size-5", text)} aria-hidden />
        </div>
        {done && <Badge tone="success">Cumplido</Badge>}
      </div>
      <div className="text-strong mt-3 text-[13px] leading-4 font-semibold">{label}</div>
      <div className="text-muted min-h-4 text-xs leading-4">{hint}</div>
      <div className="text-strong mt-2 text-[28px] leading-8 font-semibold">
        {value} <span className="text-muted text-base font-normal">/ {target}</span>
      </div>
      <div
        className={cn("rounded-pill mt-auto h-2", tint)}
        role="progressbar"
        aria-label={`${label}: ${value} de ${target}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div
          className={cn(
            "rounded-pill h-2 transition-[width] duration-500 motion-reduce:transition-none",
            bar,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-muted mt-1.5 text-xs leading-4">{pct}%</div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Inicio"
        description="Fase inicial · objetivos de 6 meses"
        actions={<Badge tone="warning">Datos de ejemplo</Badge>}
      />

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">
          Objetivos
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section>
          <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Hoy</h2>
          <EmptyState icon={CalendarDays} title="Sin citas hoy" text="Las citas del día aparecerán aquí." />
        </section>
        <section>
          <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Próximos seguimientos</h2>
          <EmptyState
            icon={CheckSquare}
            title="Nada pendiente"
            text="Las tareas que vencen pronto aparecerán aquí."
          />
        </section>
      </div>
    </>
  );
}
