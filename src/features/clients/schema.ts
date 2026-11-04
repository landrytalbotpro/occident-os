import { z } from "zod";

export const PRODUCT_CATEGORY_LABEL: Record<string, string> = {
  auto: "Auto",
  hogar: "Hogar",
  salud: "Salud",
  responsabilidad_civil: "Responsabilidad civil",
  comercio: "Comercio",
  mascotas: "Mascotas",
  vida_riesgo: "Vida riesgo",
  vida_ahorro: "Vida ahorro",
  decesos: "Decesos",
  accidentes: "Accidentes",
  otros: "Otros",
};

export const LINE_LABEL = { ssgg: "Seguros generales", vida: "Vida" } as const;

/** Umbral de prima para que una póliza cuente en los objetivos (igual que la vista monthly_results). */
export const MIN_QUALIFYING_PREMIUM = 50;

export const policySchema = z.object({
  client_id: z.uuid(),
  product_id: z.uuid({ error: "Elige un producto" }),
  annual_premium: z
    .string()
    .trim()
    .min(1, { error: "Indica la prima anual" })
    .transform((raw, ctx) => {
      // Acepta "245", "245,50", "245.50", "1.234,56", "1 234 €"
      const cleaned = raw
        .replace(/\s|€/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "")
        .replace(",", ".");
      const n = Number(cleaned);
      if (!/^\d+(\.\d{1,2})?$/.test(cleaned) || !Number.isFinite(n)) {
        ctx.addIssue({ code: "custom", message: "Prima no válida (ej.: 245,50)" });
        return z.NEVER;
      }
      if (n > 99_999_999) {
        ctx.addIssue({ code: "custom", message: "Prima demasiado alta" });
        return z.NEVER;
      }
      return Math.round(n * 100) / 100;
    }),
  effective_date: z.iso.date({ error: "Fecha no válida" }),
  external_ref: z
    .string()
    .trim()
    .max(60, { error: "Máximo 60 caracteres" })
    .optional()
    .transform((v) => (v ? v : null)),
});
