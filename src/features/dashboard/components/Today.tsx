import { CalendarDays, CheckSquare, MapPin } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDay, formatTime } from "@/lib/dates";
import { getTodayAppointments, getUpcomingTasks } from "../queries";

export async function TodayAppointments() {
  const items = await getTodayAppointments();
  if (items.length === 0) {
    return <EmptyState icon={CalendarDays} title="Sin citas hoy" text="Las citas del día aparecerán aquí." />;
  }
  return (
    <Card className="p-0">
      <ul className="divide-border divide-y">
        {items.map((a) => (
          <li key={a.id} className="flex gap-4 px-4 py-3">
            <div className="text-strong w-12 shrink-0 font-semibold tabular-nums">
              {formatTime(a.starts_at)}
            </div>
            <div className="min-w-0">
              <div className="text-strong truncate font-semibold">{a.title}</div>
              <div className="text-muted flex flex-wrap gap-x-3">
                {a.contact && <span className="truncate">{a.contact}</span>}
                {a.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {a.location}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export async function UpcomingTasks() {
  const items = await getUpcomingTasks();
  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Nada pendiente"
        text="Las tareas que vencen pronto aparecerán aquí."
      />
    );
  }
  return (
    <Card className="p-0">
      <ul className="divide-border divide-y">
        {items.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="text-strong font-semibold">{t.title}</div>
              {t.contact && <div className="text-muted truncate">{t.contact}</div>}
            </div>
            {t.due_at && (
              <Badge tone={t.overdue ? "danger" : "neutral"} className="shrink-0">
                {t.overdue ? "Vencida · " : ""}
                {formatDay(t.due_at)}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ListFallback() {
  return (
    <div className="bg-surface-2 h-40 animate-pulse rounded-md motion-reduce:animate-none" aria-busy="true" />
  );
}
