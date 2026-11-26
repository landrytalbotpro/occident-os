"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Field, Input, Select, describedBy } from "@/components/ui";
import type { FormState } from "@/features/prospects/schema";
import { saveRenewal } from "../actions";
import type { RenewalItem } from "../queries";
import { MONTHS, NOTE_MAX, RENEWAL_PRODUCTS } from "../schema";

const NOTE_HINT = "Breve. Sin compañía, precio ni datos personales.";

/** Alta (sin `renewal`) o edición de un vencimiento. */
export function RenewalForm({
  prospectId,
  renewal,
  usedProducts,
  onDone,
}: {
  prospectId: string;
  renewal?: RenewalItem;
  usedProducts: string[];
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveRenewal, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    if (renewal) onDone?.();
    else formRef.current?.reset();
  }, [state, renewal, onDone]);

  // Ids únicos por formulario (puede haber varios en la página)
  const pfx = renewal ? `rn-${renewal.id}` : "rn-new";
  const id = (k: string) => `${pfx}-${k}`;
  const e = (k: string) => state.fieldErrors?.[k];
  const v = (k: string, d = "") => (state.ok ? d : (state.values?.[k] ?? d));

  // Ramos ya usados (salvo el propio al editar) no se ofrecen: uno por ramo y contacto
  const products = RENEWAL_PRODUCTS.filter((p) => p === renewal?.product || !usedProducts.includes(p));
  if (!renewal && products.length === 0) {
    return <p className="text-muted">Ya están todos los ramos registrados.</p>;
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-3">
      <input type="hidden" name="prospect_id" value={prospectId} />
      <input type="hidden" name="id" value={renewal?.id ?? ""} />
      {state.error && (
        <p role="alert" className="bg-danger/10 text-danger rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field id={id("product")} label="Ramo" error={e("product")}>
          <Select
            id={id("product")}
            name="product"
            defaultValue={v("product", renewal?.product ?? "")}
            invalid={!!e("product")}
            aria-describedby={describedBy(id("product"), e("product"))}
          >
            {!renewal && <option value="">Elige…</option>}
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={id("month")} label="Mes" error={e("month")}>
          <Select
            id={id("month")}
            name="month"
            defaultValue={v("month", renewal ? String(renewal.month) : "")}
            invalid={!!e("month")}
            aria-describedby={describedBy(id("month"), e("month"))}
          >
            {!renewal && <option value="">Elige…</option>}
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m[0].toUpperCase() + m.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field id={id("note")} label="Nota" optional error={e("note")} hint={NOTE_HINT}>
        <Input
          id={id("note")}
          name="note"
          maxLength={NOTE_MAX}
          defaultValue={v("note", renewal?.note ?? "")}
          invalid={!!e("note")}
          aria-describedby={describedBy(id("note"), e("note"), NOTE_HINT)}
          placeholder="Le sube mucho cada año"
        />
      </Field>
      <div className="flex justify-end gap-2">
        {renewal && (
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={pending}>
          {renewal ? "Guardar" : "Añadir vencimiento"}
        </Button>
      </div>
    </form>
  );
}
