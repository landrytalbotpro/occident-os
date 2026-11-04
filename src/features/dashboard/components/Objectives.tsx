import { FileCheck2, HeartHandshake, HeartPulse, Home, Shield, Target, type LucideIcon } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { getObjectives, type Metric } from "../queries";

const META: Record<
  Metric,
  { label: string; hint?: string; icon: LucideIcon; bar: string; text: string; tint: string }
> = {
  total: {
    label: "Pólizas",
    icon: FileCheck2,
    bar: "bg-cat-total",
    text: "text-cat-total",
    tint: "bg-cat-total/10",
  },
  ssgg: {
    label: "Seguros generales",
    icon: Shield,
    bar: "bg-cat-ssgg",
    text: "text-cat-ssgg",
    tint: "bg-cat-ssgg/10",
  },
  hogar: {
    label: "Hogar",
    hint: "dentro de SSGG",
    icon: Home,
    bar: "bg-cat-hogar",
    text: "text-cat-hogar",
    tint: "bg-cat-hogar/10",
  },
  vida: {
    label: "Vida",
    icon: HeartPulse,
    bar: "bg-cat-vida",
    text: "text-cat-vida",
    tint: "bg-cat-vida/10",
  },
  vida_riesgo: {
    label: "Vida riesgo",
    hint: "dentro de Vida",
    icon: HeartHandshake,
    bar: "bg-cat-vida-riesgo",
    text: "text-cat-vida-riesgo",
    tint: "bg-cat-vida-riesgo/10",
  },
};

function KpiCard({ metric, value, target }: { metric: Metric; value: number; target: number }) {
  const { label, hint, icon: Icon, bar, text, tint } = META[metric];
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

export async function Objectives() {
  const data = await getObjectives();
  if (!data) {
    return (
      <EmptyState
        icon={Target}
        title="No hay objetivos para el periodo actual"
        text="Cuando definas tus objetivos, aquí verás cómo avanzas en cada categoría."
      />
    );
  }
  const { period, items } = data;
  return (
    <>
      <p className="text-muted mb-3">
        {formatDate(period.start)} – {formatDate(period.end)} · día {period.elapsedDays} de {period.totalDays}{" "}
        · cuentan las pólizas con prima &gt; 50 €
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {items.map((k) => (
          <KpiCard key={k.metric} {...k} />
        ))}
      </div>
    </>
  );
}

export function ObjectivesFallback() {
  return (
    <div aria-busy="true" aria-label="Cargando objetivos">
      <div className="bg-surface-2 mb-3 h-5 w-72 animate-pulse rounded-sm motion-reduce:animate-none" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface-2 h-44 animate-pulse rounded-md motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
