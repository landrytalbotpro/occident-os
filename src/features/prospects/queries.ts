import "server-only";
import { db } from "@/lib/db";
import { STAGES, type InteractionKind, type Segment, type Stage } from "./schema";

export type ProspectListItem = {
  id: string;
  full_name: string;
  company_name: string | null;
  segment: Segment;
  stage: Stage;
  municipality: string | null;
  phone: string | null;
  next_action_at: string | null;
  updated_at: string;
  lead_source: { name: string } | null;
};

/** Caracteres con significado en los filtros de PostgREST: se eliminan de la búsqueda. */
function cleanSearch(q: string) {
  return q
    .replace(/[%,().*:\\"']/g, " ")
    .trim()
    .slice(0, 60);
}

export async function listProspects({
  stage,
  q,
}: {
  stage?: Stage;
  q?: string;
}): Promise<ProspectListItem[]> {
  const supabase = await db();
  let query = supabase
    .from("prospects")
    .select(
      "id, full_name, company_name, segment, stage, municipality, phone, next_action_at, updated_at, lead_source:lead_sources(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);
  if (stage) query = query.eq("stage", stage);
  const term = q ? cleanSearch(q) : "";
  if (term) {
    query = query.or(`full_name.ilike.%${term}%,company_name.ilike.%${term}%,municipality.ilike.%${term}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error("No se pudieron cargar los prospects");
  return (data ?? []) as unknown as ProspectListItem[];
}

export async function countByStage(): Promise<Record<Stage, number>> {
  const supabase = await db();
  const { data, error } = await supabase.from("prospects").select("stage");
  if (error) throw new Error("No se pudieron contar los prospects");
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  for (const r of (data ?? []) as { stage: Stage }[]) counts[r.stage]++;
  return counts;
}

export type ProspectDetail = ProspectListItem & {
  email: string | null;
  postal_code: string | null;
  lost_reason: string | null;
  lead_source_id: string | null;
  notes: string | null;
  legal_basis: "consentimiento" | "interes_legitimo" | "medidas_precontractuales";
  consent_at: string | null;
  consent_source: string | null;
  created_at: string;
  client: { id: string } | null;
};

export async function getProspect(id: string): Promise<ProspectDetail | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("prospects")
    .select("*, lead_source:lead_sources(name), client:clients(id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar el prospect");
  if (!data) return null;
  const row = data as unknown as ProspectDetail & { client: { id: string }[] | { id: string } | null };
  const client = Array.isArray(row.client) ? (row.client[0] ?? null) : row.client;
  return { ...row, client };
}

export type InteractionItem = {
  id: string;
  kind: InteractionKind;
  occurred_at: string;
  summary: string | null;
};

export async function listInteractions(prospectId: string): Promise<InteractionItem[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("interactions")
    .select("id, kind, occurred_at, summary")
    .eq("prospect_id", prospectId)
    .order("occurred_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No se pudo cargar el historial");
  return (data ?? []) as InteractionItem[];
}

export type ProspectTask = { id: string; title: string; due_at: string | null; done_at: string | null };

export async function listProspectTasks(prospectId: string): Promise<ProspectTask[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_at, done_at")
    .eq("prospect_id", prospectId)
    .order("done_at", { ascending: true, nullsFirst: true })
    .order("due_at", { ascending: true })
    .limit(50);
  if (error) throw new Error("No se pudieron cargar las tareas");
  return (data ?? []) as ProspectTask[];
}

export type LeadSource = { id: string; name: string };

export async function listLeadSources(): Promise<LeadSource[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("lead_sources")
    .select("id, name")
    .eq("active", true)
    .order("name");
  if (error) throw new Error("No se pudieron cargar las fuentes");
  return (data ?? []) as LeadSource[];
}
