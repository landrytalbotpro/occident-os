import { z } from "zod";

/** Ramos controlados (mismo listado que el CHECK de la tabla renewals). */
export const RENEWAL_PRODUCTS = [
  "Coche",
  "Hogar",
  "Vida",
  "Decesos",
  "Salud",
  "Ahorro/PP",
  "Local/Comercio",
  "RC",
  "Vehículos empresa",
  "Accidentes/IT",
  "Otros",
] as const;
export type RenewalProduct = (typeof RENEWAL_PRODUCTS)[number];

export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/** 1-12 → "septiembre" */
export const monthLabel = (m: number) => MONTHS[m - 1] ?? "";

export const NOTE_MAX = 140;

export const renewalSchema = z.object({
  prospect_id: z.uuid(),
  product: z.enum(RENEWAL_PRODUCTS, { error: "Elige un ramo" }),
  month: z.coerce
    .number({ error: "Elige un mes" })
    .int({ error: "Elige un mes" })
    .min(1, { error: "Elige un mes" })
    .max(12, { error: "Elige un mes" }),
  note: z
    .string()
    .trim()
    .max(NOTE_MAX, { error: `Máximo ${NOTE_MAX} caracteres` })
    .optional()
    .transform((v) => (v ? v : null)),
});
