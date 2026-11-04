import { z } from "zod";
import { madridLocalToISO } from "@/lib/dates";

export const STAGES = ["nuevo", "contactado", "cita", "propuesta", "ganado", "perdido"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cita: "Cita",
  propuesta: "Propuesta",
  ganado: "Ganado",
  perdido: "Perdido",
};

export const SEGMENTS = ["particular", "autonomo", "pyme"] as const;
export type Segment = (typeof SEGMENTS)[number];
export const SEGMENT_LABEL: Record<Segment, string> = {
  particular: "Particular",
  autonomo: "Autónomo",
  pyme: "Pyme",
};

export const LEGAL_BASES = ["consentimiento", "interes_legitimo", "medidas_precontractuales"] as const;
export const LEGAL_BASIS_LABEL: Record<(typeof LEGAL_BASES)[number], string> = {
  consentimiento: "Consentimiento",
  interes_legitimo: "Interés legítimo",
  medidas_precontractuales: "Medidas precontractuales (pidió presupuesto)",
};

export const INTERACTION_KINDS = ["llamada", "whatsapp", "email", "visita", "reunion", "otro"] as const;
export type InteractionKind = (typeof INTERACTION_KINDS)[number];
export const INTERACTION_LABEL: Record<InteractionKind, string> = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  email: "Email",
  visita: "Visita",
  reunion: "Reunión",
  otro: "Otro",
};

/** "" → null para campos opcionales de formulario */
const optionalText = (max: number, msg?: string) =>
  z
    .string()
    .trim()
    .max(max, { error: msg ?? `Máximo ${max} caracteres` })
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const prospectSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, { error: "El nombre es obligatorio" })
      .max(120, { error: "Máximo 120 caracteres" }),
    company_name: optionalText(120),
    segment: z.enum(SEGMENTS, { error: "Elige un tipo" }),
    phone: optionalText(30),
    email: z
      .union([z.literal(""), z.email({ error: "Email no válido" }).max(254)])
      .optional()
      .transform((v) => (v ? v : null)),
    municipality: optionalText(80),
    postal_code: z
      .union([z.literal(""), z.string().regex(/^[0-9]{5}$/, { error: "El código postal tiene 5 cifras" })])
      .optional()
      .transform((v) => (v ? v : null)),
    stage: z.enum(STAGES),
    lost_reason: optionalText(200),
    lead_source_id: z
      .union([z.literal(""), z.uuid()])
      .optional()
      .transform((v) => (v ? v : null)),
    next_action_at: z
      .string()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        const iso = madridLocalToISO(v);
        if (!iso) {
          ctx.addIssue({ code: "custom", message: "Fecha no válida" });
          return z.NEVER;
        }
        return iso;
      }),
    notes: optionalText(2000),
    legal_basis: z.enum(LEGAL_BASES),
    consent_given: z
      .string()
      .optional()
      .transform((v) => v === "on"),
    consent_source: optionalText(120),
  })
  .superRefine((v, ctx) => {
    if (!v.phone && !v.email) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Indica al menos un teléfono o un email" });
    }
    if (v.legal_basis === "consentimiento" && !v.consent_given) {
      ctx.addIssue({
        code: "custom",
        path: ["consent_given"],
        message: "Con base «Consentimiento», confirma que la persona ha aceptado ser contactada",
      });
    }
  });

export type ProspectInput = z.input<typeof prospectSchema>;

export const interactionSchema = z.object({
  prospect_id: z.uuid(),
  kind: z.enum(INTERACTION_KINDS, { error: "Elige un tipo" }),
  summary: z
    .string()
    .trim()
    .min(1, { error: "Escribe un resumen corto" })
    .max(1000, { error: "Máximo 1000 caracteres" }),
});

export const stageSchema = z.object({
  id: z.uuid(),
  stage: z.enum(STAGES),
});

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}
