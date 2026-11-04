import type { Metadata } from "next";
import { CalendarDays, CheckSquare } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Inicio" };

// Estructura del dashboard. Los objetivos vendrán de `targets` y los resultados de la vista mensual (etapa 3).
// Valores de ejemplo, ficticios.
const kpis = [
  { label: "Pólizas", value: 0, target: 42 },
  { label: "Seguros generales", value: 0, target: 12 },
  { label: "Hogar", value: 0, target: 6 },
  { label: "Vida", value: 0, target: 12 },
  { label: "Vida riesgo", value: 0, target: 6 },
];

function Kpi({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const done = value >= target;
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted text-[13px] leading-4 font-semibold">{label}</span>
        {done && <Badge tone="success">Cumplido</Badge>}
      </div>
      <div className="text-strong mt-2 text-[28px] leading-8 font-semibold">
        {value} <span className="text-muted text-base font-normal">/ {target}</span>
      </div>
      <div
        className="rounded-pill bg-surface-2 mt-3 h-1.5"
        role="progressbar"
        aria-label={`${label}: ${value} de ${target}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div
          className={done ? "rounded-pill bg-success h-1.5" : "rounded-pill bg-brand h-1.5"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Inicio" description="Fase inicial · objetivos de 6 meses" />

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">
          Objetivos
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => (
            <Kpi key={k.label} {...k} />
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
