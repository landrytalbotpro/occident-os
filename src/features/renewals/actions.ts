"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/dates";
import { fieldErrorsFrom, type FormState } from "@/features/prospects/schema";
import { currentOccurrence, parseYMD } from "./occurrence";
import { renewalSchema } from "./schema";

/** Alta o edición de un vencimiento. */
export async function saveRenewal(_prev: FormState, formData: FormData): Promise<FormState> {
  const values: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  });
  const idParse = z.union([z.literal(""), z.uuid()]).safeParse(values.id ?? "");
  if (!idParse.success) return { error: "Identificador no válido", values };
  const id = idParse.data || null;

  const parsed = renewalSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

  const supabase = await createClient();
  let error: { code?: string } | null;
  if (id) {
    const { prospect_id, ...patch } = parsed.data;
    const { data: existing } = await supabase.from("renewals").select("month").eq("id", id).maybeSingle();
    if (!existing) return { error: "Este vencimiento ya no existe.", values };
    // Si cambia el mes, el «ya llamado» deja de valer
    const reset = (existing as { month: number }).month !== patch.month ? { handled_year: null } : {};
    ({ error } = await supabase
      .from("renewals")
      .update({ ...patch, ...reset })
      .eq("id", id)
      .eq("prospect_id", prospect_id));
  } else {
    ({ error } = await supabase.from("renewals").insert(parsed.data));
  }

  if (error) {
    if (error.code === "23505") {
      return {
        fieldErrors: { product: `Ya hay un vencimiento de ${parsed.data.product} para este contacto` },
        values,
      };
    }
    return { error: "No se pudo guardar el vencimiento. Inténtalo de nuevo.", values };
  }
  refresh();
  return { ok: true };
}

export async function deleteRenewal(formData: FormData): Promise<void> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("renewals").delete().eq("id", id.data);
  refresh();
}

/** «Contactado»: marca como tratada la ocurrencia vigente (vuelve sola el año siguiente). */
export async function markRenewalHandled(formData: FormData): Promise<void> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  const { data } = await supabase.from("renewals").select("month").eq("id", id.data).maybeSingle();
  if (!data) return;
  // El año se calcula en el servidor, no se confía en el navegador
  const occ = currentOccurrence((data as { month: number }).month, parseYMD(localDate()));
  await supabase.from("renewals").update({ handled_year: occ.year }).eq("id", id.data);
  refresh();
}
