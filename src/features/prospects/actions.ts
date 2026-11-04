"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, interactionSchema, prospectSchema, stageSchema, type FormState } from "./schema";

function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string" && !k.startsWith("$")) out[k] = v;
  });
  return out;
}

export async function saveProspect(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const idParse = z.union([z.literal(""), z.uuid()]).safeParse(values.id ?? "");
  if (!idParse.success) return { error: "Identificador no válido", values };
  const id = idParse.data || null;

  const parsed = prospectSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };

  const { consent_given, ...p } = parsed.data;
  const supabase = await createClient();

  // Consentimiento: se registra la fecha la primera vez que se marca
  let consent_at: string | null = null;
  if (consent_given) {
    if (id) {
      const { data: existing } = await supabase
        .from("prospects")
        .select("consent_at")
        .eq("id", id)
        .maybeSingle();
      consent_at = (existing as { consent_at: string | null } | null)?.consent_at ?? new Date().toISOString();
    } else {
      consent_at = new Date().toISOString();
    }
  }
  const row = {
    ...p,
    lost_reason: p.stage === "perdido" ? p.lost_reason : null,
    consent_at,
    consent_source: consent_given ? p.consent_source : null,
  };

  if (id) {
    const { error } = await supabase.from("prospects").update(row).eq("id", id);
    if (error) return { error: "No se pudo guardar. Inténtalo de nuevo.", values };
    redirect(`/crm/prospects/${id}`);
  }

  const { data, error } = await supabase.from("prospects").insert(row).select("id").single();
  if (error || !data) return { error: "No se pudo crear el prospect. Inténtalo de nuevo.", values };
  redirect(`/crm/prospects/${(data as { id: string }).id}`);
}

export async function changeStage(formData: FormData): Promise<void> {
  const parsed = stageSchema.safeParse({ id: formData.get("id"), stage: formData.get("stage") });
  if (!parsed.success) return;
  const supabase = await createClient();
  const patch: { stage: string; lost_reason?: null } = { stage: parsed.data.stage };
  if (parsed.data.stage !== "perdido") patch.lost_reason = null;
  await supabase.from("prospects").update(patch).eq("id", parsed.data.id);
  refresh();
}

export async function addInteraction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = interactionSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error), values };
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").insert(parsed.data);
  if (error) return { error: "No se pudo guardar el registro.", values };
  // Un contacto registrado en un prospect "nuevo" lo pasa a "contactado"
  await supabase
    .from("prospects")
    .update({ stage: "contactado" })
    .eq("id", parsed.data.prospect_id)
    .eq("stage", "nuevo");
  refresh();
  return { ok: true };
}

export async function deleteProspect(formData: FormData): Promise<void> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("prospects").delete().eq("id", id.data);
  redirect("/crm/prospects");
}
