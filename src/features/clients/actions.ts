"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/features/prospects/schema";
import { policySchema } from "./schema";

/** Convierte un prospect en cliente (copia solo los datos de contacto) y lo marca como ganado. */
export async function convertProspect(formData: FormData): Promise<void> {
  const id = z.uuid().safeParse(formData.get("prospect_id"));
  if (!id.success) return;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("prospects")
    .select("id, full_name, company_name, segment, phone, email, municipality, postal_code")
    .eq("id", id.data)
    .maybeSingle();
  if (!p) redirect("/crm/prospects");

  const { id: prospect_id, ...contact } = p as {
    id: string;
    full_name: string;
    company_name: string | null;
    segment: string;
    phone: string | null;
    email: string | null;
    municipality: string | null;
    postal_code: string | null;
  };

  const { data: created, error } = await supabase
    .from("clients")
    .insert({ ...contact, prospect_id, legal_basis: "medidas_precontractuales" })
    .select("id")
    .single();

  let clientId = (created as { id: string } | null)?.id;
  if (error) {
    // Ya convertido (prospect_id único): ir al cliente existente
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("prospect_id", prospect_id)
      .maybeSingle();
    clientId = (existing as { id: string } | null)?.id;
    if (!clientId) return;
  }

  await supabase.from("prospects").update({ stage: "ganado", lost_reason: null }).eq("id", prospect_id);
  redirect(`/crm/clients/${clientId}`);
}

export async function addPolicy(_prev: FormState, formData: FormData): Promise<FormState> {
  const values: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  });
  const parsed = policySchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.from("policies").insert(parsed.data);
  if (error) return { error: "No se pudo guardar la póliza. Inténtalo de nuevo.", values };
  refresh();
  return { ok: true };
}

export async function setPolicyStatus(formData: FormData): Promise<void> {
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["emitida", "anulada"]) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("policies").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  refresh();
}
