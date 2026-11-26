import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { localDate } from "@/lib/dates";
import { currentOccurrence, isDue, parseYMD } from "./occurrence";
import type { RenewalProduct } from "./schema";

export type RenewalItem = {
  id: string;
  prospect_id: string;
  product: RenewalProduct;
  month: number;
  note: string | null;
  handled_year: number | null;
};

const COLUMNS = "id, prospect_id, product, month, note, handled_year";

/** Vencimientos de un prospect (o del cliente convertido desde él), por mes. */
export async function listRenewals(prospectId: string): Promise<RenewalItem[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("renewals")
    .select(COLUMNS)
    .eq("prospect_id", prospectId)
    .order("month")
    .order("product");
  if (error) throw new Error("No se pudieron cargar los vencimientos");
  return (data ?? []) as RenewalItem[];
}

export type DueRenewal = RenewalItem & {
  name: string;
  phone: string | null;
  href: string;
  occurrenceDate: string;
  occurrenceYear: number;
  daysUntil: number;
};

type ClientRef = { id: string; full_name: string; phone: string | null };

type Row = RenewalItem & {
  prospect: {
    id: string;
    full_name: string;
    phone: string | null;
    // clients.prospect_id es único: PostgREST puede devolver objeto o lista
    client: ClientRef[] | ClientRef | null;
  } | null;
};

/**
 * Vencimientos a llamar en los próximos 90 días (sin tratar), por fecha.
 * Memoizado por petición: lo usan la tarjeta y el KPI del inicio.
 */
export const getDueRenewals = cache(async (): Promise<DueRenewal[]> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("renewals")
    .select(`${COLUMNS}, prospect:prospects(id, full_name, phone, client:clients(id, full_name, phone))`)
    .limit(2000);
  if (error) throw new Error("No se pudieron cargar los vencimientos");

  const today = parseYMD(localDate());
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.prospect && isDue(r.month, r.handled_year, today))
    .map(({ prospect, ...r }) => {
      const p = prospect!;
      const client = Array.isArray(p.client) ? (p.client[0] ?? null) : p.client;
      const occ = currentOccurrence(r.month, today);
      return {
        ...r,
        name: client?.full_name ?? p.full_name,
        phone: client?.phone ?? p.phone,
        href: client ? `/crm/clients/${client.id}` : `/crm/prospects/${p.id}`,
        occurrenceDate: occ.date,
        occurrenceYear: occ.year,
        daysUntil: occ.daysUntil,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name, "es"));
});
