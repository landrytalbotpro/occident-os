import "server-only";
import { db } from "@/lib/db";
import { localDate, todayRange } from "@/lib/dates";

export type Metric = "total" | "ssgg" | "hogar" | "vida" | "vida_riesgo";

export type ObjectiveProgress = {
  metric: Metric;
  target: number;
  value: number;
};

export type Period = { start: string; end: string; elapsedDays: number; totalDays: number };

const RESULT_COLUMN: Record<Metric, string> = {
  total: "qualifying_total",
  ssgg: "qualifying_ssgg",
  hogar: "qualifying_hogar",
  vida: "qualifying_vida",
  vida_riesgo: "qualifying_vida_riesgo",
};

type TargetRow = { period_start: string; period_end: string; metric: Metric; target_value: number };
type ResultRow = { month: string } & Record<string, number | string>;

/** Objetivos del periodo en curso y su avance (pólizas emitidas con prima > 50 €). */
export async function getObjectives(): Promise<{ period: Period; items: ObjectiveProgress[] } | null> {
  const supabase = await db();
  const today = localDate();

  const { data: targets, error } = await supabase
    .from("targets")
    .select("period_start, period_end, metric, target_value")
    .lte("period_start", today)
    .gte("period_end", today)
    .order("period_start", { ascending: false });
  if (error) throw new Error("No se pudieron cargar los objetivos");
  const rows = (targets ?? []) as TargetRow[];
  if (rows.length === 0) return null;

  const { period_start, period_end } = rows[0];
  const current = rows.filter((r) => r.period_start === period_start);

  const { data: results, error: rErr } = await supabase
    .from("monthly_results")
    .select("month, " + Object.values(RESULT_COLUMN).join(", "))
    .gte("month", period_start.slice(0, 7) + "-01")
    .lte("month", period_end);
  if (rErr) throw new Error("No se pudieron cargar los resultados");
  const res = (results ?? []) as unknown as ResultRow[];

  const sum = (col: string) => res.reduce((acc, r) => acc + Number(r[col] ?? 0), 0);

  const day = 86_400_000;
  const startMs = Date.parse(period_start + "T00:00:00Z");
  const endMs = Date.parse(period_end + "T00:00:00Z");
  const todayMs = Date.parse(today + "T00:00:00Z");

  const order: Metric[] = ["total", "ssgg", "hogar", "vida", "vida_riesgo"];
  return {
    period: {
      start: period_start,
      end: period_end,
      totalDays: Math.round((endMs - startMs) / day) + 1,
      elapsedDays: Math.round((todayMs - startMs) / day) + 1,
    },
    items: order
      .map((metric) => current.find((t) => t.metric === metric))
      .filter((t): t is TargetRow => Boolean(t))
      .map((t) => ({ metric: t.metric, target: t.target_value, value: sum(RESULT_COLUMN[t.metric]) })),
  };
}

type Named = { full_name: string } | null;

export type AppointmentItem = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  contact: string | null;
};

/** Citas programadas de hoy (zona Europe/Madrid). */
export async function getTodayAppointments(): Promise<AppointmentItem[]> {
  const supabase = await db();
  const { start, end } = todayRange();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, title, starts_at, location, prospect:prospects(full_name), client:clients(full_name)")
    .eq("status", "programada")
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at");
  if (error) throw new Error("No se pudieron cargar las citas");
  return ((data ?? []) as unknown as Array<AppointmentItem & { prospect: Named; client: Named }>).map(
    (a) => ({
      id: a.id,
      title: a.title,
      starts_at: a.starts_at,
      location: a.location,
      contact: a.prospect?.full_name ?? a.client?.full_name ?? null,
    }),
  );
}

export type TaskItem = {
  id: string;
  title: string;
  due_at: string | null;
  contact: string | null;
  overdue: boolean;
};

/** Próximas tareas abiertas (vencidas primero). */
export async function getUpcomingTasks(limit = 5): Promise<TaskItem[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_at, prospect:prospects(full_name), client:clients(full_name)")
    .is("done_at", null)
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error("No se pudieron cargar las tareas");
  const now = Date.now();
  return (
    (data ?? []) as unknown as Array<{
      id: string;
      title: string;
      due_at: string | null;
      prospect: Named;
      client: Named;
    }>
  ).map((t) => ({
    id: t.id,
    title: t.title,
    due_at: t.due_at,
    contact: t.prospect?.full_name ?? t.client?.full_name ?? null,
    overdue: t.due_at ? Date.parse(t.due_at) < now : false,
  }));
}
