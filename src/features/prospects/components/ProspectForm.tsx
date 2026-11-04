"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea, describedBy } from "@/components/ui";
import { saveProspect } from "../actions";
import {
  LEGAL_BASES,
  LEGAL_BASIS_LABEL,
  SEGMENTS,
  SEGMENT_LABEL,
  STAGES,
  STAGE_LABEL,
  type FormState,
} from "../schema";

export type ProspectFormDefaults = Record<string, string | boolean | undefined>;

export function ProspectForm({
  id,
  defaults,
  leadSources,
  cancelHref,
}: {
  id?: string;
  defaults: ProspectFormDefaults;
  leadSources: { id: string; name: string }[];
  cancelHref: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProspect, {});
  const v = (k: string) => state.values?.[k] ?? (defaults[k] as string | undefined) ?? "";
  const e = (k: string) => state.fieldErrors?.[k];

  const [stage, setStage] = useState(v("stage") || "nuevo");
  const [basis, setBasis] = useState(v("legal_basis") || "consentimiento");
  const consentDefault = state.values ? state.values.consent_given === "on" : Boolean(defaults.consent_given);

  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="id" value={id ?? ""} />

      {state.error && (
        <p role="alert" className="bg-danger/10 text-danger rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <Card className="space-y-4 p-5">
        <h2 className="text-strong text-base leading-6 font-semibold">Contacto</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="full_name" label="Nombre y apellidos" error={e("full_name")}>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={v("full_name")}
              autoComplete="off"
              invalid={!!e("full_name")}
              aria-describedby={describedBy("full_name", e("full_name"))}
              required
            />
          </Field>
          <Field id="segment" label="Tipo" error={e("segment")}>
            <Select id="segment" name="segment" defaultValue={v("segment") || "particular"}>
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {SEGMENT_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="company_name" label="Empresa o negocio" optional error={e("company_name")}>
            <Input id="company_name" name="company_name" defaultValue={v("company_name")} />
          </Field>
          <Field id="municipality" label="Municipio" optional error={e("municipality")}>
            <Input
              id="municipality"
              name="municipality"
              defaultValue={v("municipality")}
              placeholder="Gijón"
            />
          </Field>
          <Field id="phone" label="Teléfono" error={e("phone")} hint="Teléfono o email: al menos uno.">
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={v("phone")}
              invalid={!!e("phone")}
              aria-describedby={describedBy("phone", e("phone"), "Teléfono o email: al menos uno.")}
            />
          </Field>
          <Field id="email" label="Email" optional error={e("email")}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={v("email")}
              invalid={!!e("email")}
              aria-describedby={describedBy("email", e("email"))}
            />
          </Field>
          <Field id="postal_code" label="Código postal" optional error={e("postal_code")}>
            <Input
              id="postal_code"
              name="postal_code"
              inputMode="numeric"
              maxLength={5}
              defaultValue={v("postal_code")}
              invalid={!!e("postal_code")}
              aria-describedby={describedBy("postal_code", e("postal_code"))}
            />
          </Field>
          <Field id="lead_source_id" label="¿Cómo llegó?" optional>
            <Select id="lead_source_id" name="lead_source_id" defaultValue={v("lead_source_id")}>
              <option value="">—</option>
              {leadSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-strong text-base leading-6 font-semibold">Seguimiento</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="stage" label="Etapa">
            <Select id="stage" name="stage" value={stage} onChange={(ev) => setStage(ev.target.value)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="next_action_at" label="Próximo paso" optional error={e("next_action_at")}>
            <Input
              id="next_action_at"
              name="next_action_at"
              type="datetime-local"
              defaultValue={v("next_action_at")}
              invalid={!!e("next_action_at")}
            />
          </Field>
          {stage === "perdido" && (
            <div className="md:col-span-2">
              <Field id="lost_reason" label="Motivo" optional error={e("lost_reason")}>
                <Input
                  id="lost_reason"
                  name="lost_reason"
                  defaultValue={v("lost_reason")}
                  placeholder="Se quedó con su compañía actual"
                />
              </Field>
            </div>
          )}
          <div className="md:col-span-2">
            <Field
              id="notes"
              label="Notas"
              optional
              error={e("notes")}
              hint="Solo notas comerciales. Nunca datos de salud, DNI ni datos bancarios."
            >
              <Textarea
                id="notes"
                name="notes"
                maxLength={2000}
                defaultValue={v("notes")}
                aria-describedby={describedBy(
                  "notes",
                  e("notes"),
                  "Solo notas comerciales. Nunca datos de salud, DNI ni datos bancarios.",
                )}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-strong text-base leading-6 font-semibold">Protección de datos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="legal_basis" label="Base legal para contactar">
            <Select
              id="legal_basis"
              name="legal_basis"
              value={basis}
              onChange={(ev) => setBasis(ev.target.value)}
            >
              {LEGAL_BASES.map((b) => (
                <option key={b} value={b}>
                  {LEGAL_BASIS_LABEL[b]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="consent_source" label="¿Dónde lo aceptó?" optional>
            <Input
              id="consent_source"
              name="consent_source"
              defaultValue={v("consent_source")}
              placeholder="Llamada, DM, visita…"
            />
          </Field>
        </div>
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consent_given"
              defaultChecked={consentDefault}
              className="mt-0.5 size-5 shrink-0 accent-[var(--brand-primary)]"
              aria-describedby={e("consent_given") ? "consent_given-error" : undefined}
            />
            <span className="text-body">
              La persona ha aceptado que guarde sus datos y la contacte para hablar de seguros.
              {basis !== "consentimiento" && (
                <span className="text-muted"> (Opcional con esta base legal.)</span>
              )}
            </span>
          </label>
          {e("consent_given") && (
            <p id="consent_given-error" className="text-danger mt-1.5 text-xs leading-4">
              {e("consent_given")}
            </p>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link
          href={cancelHref}
          className="border-border bg-surface-0 text-strong hover:bg-surface-2 inline-flex h-10 items-center rounded-sm border px-4 font-semibold"
        >
          Cancelar
        </Link>
        <Button type="submit" loading={pending}>
          {id ? "Guardar cambios" : "Crear prospect"}
        </Button>
      </div>
    </form>
  );
}
