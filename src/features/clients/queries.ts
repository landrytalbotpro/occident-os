import "server-only";
import { db } from "@/lib/db";
import type { Segment } from "@/features/prospects/schema";

export type ClientListItem = {
  id: string;
  full_name: string;
  company_name: string | null;
  segment: Segment;
  municipality: string | null;
  policies: { annual_premium: number; status: "emitida" | "anulada" }[];
};

function cleanSearch(q: string) {
  return q
    .replace(/[%,().*:\\"']/g, " ")
    .trim()
    .slice(0, 60);
}

export async function listClients(q?: string): Promise<ClientListItem[]> {
  const supabase = await db();
  let query = supabase
    .from("clients")
    .select("id, full_name, company_name, segment, municipality, policies(annual_premium, status)")
    .order("full_name")
    .limit(300);
  const term = q ? cleanSearch(q) : "";
  if (term)
    query = query.or(`full_name.ilike.%${term}%,company_name.ilike.%${term}%,municipality.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error("No se pudieron cargar los clientes");
  return (data ?? []) as unknown as ClientListItem[];
}

export type PolicyItem = {
  id: string;
  annual_premium: number;
  effective_date: string;
  status: "emitida" | "anulada";
  external_ref: string | null;
  product: { name: string; category: string; line: "ssgg" | "vida" };
};

export type ClientDetail = {
  id: string;
  full_name: string;
  company_name: string | null;
  segment: Segment;
  phone: string | null;
  email: string | null;
  municipality: string | null;
  postal_code: string | null;
  prospect_id: string | null;
  created_at: string;
  policies: PolicyItem[];
};

export async function getClient(id: string): Promise<ClientDetail | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, full_name, company_name, segment, phone, email, municipality, postal_code, prospect_id, created_at, policies(id, annual_premium, effective_date, status, external_ref, product:products(name, category, line))",
    )
    .eq("id", id)
    .order("effective_date", { referencedTable: "policies", ascending: false })
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar el cliente");
  return (data ?? null) as unknown as ClientDetail | null;
}

export type Product = { id: string; name: string; category: string; line: "ssgg" | "vida" };

export async function listProducts(): Promise<Product[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, line")
    .eq("active", true)
    .order("line")
    .order("name");
  if (error) throw new Error("No se pudo cargar el catálogo");
  return (data ?? []) as Product[];
}
