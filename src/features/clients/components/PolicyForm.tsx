"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Field, Input, Select, describedBy } from "@/components/ui";
import type { FormState } from "@/features/prospects/schema";
import { addPolicy } from "../actions";
import { LINE_LABEL, MIN_QUALIFYING_PREMIUM } from "../schema";
import type { Product } from "../queries";

export function PolicyForm({
  clientId,
  products,
  today,
}: {
  clientId: string;
  products: Product[];
  today: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(addPolicy, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const e = (k: string) => state.fieldErrors?.[k];
  const v = (k: string, d = "") => (state.ok ? d : (state.values?.[k] ?? d));
  const premiumHint = `Cuenta para tus objetivos si es mayor de ${MIN_QUALIFYING_PREMIUM} €.`;
  const groups = (["ssgg", "vida"] as const).map((line) => ({
    line,
    items: products.filter((p) => p.line === line),
  }));

  return (
    <form ref={formRef} action={action} noValidate className="space-y-3">
      <input type="hidden" name="client_id" value={clientId} />
      {state.error && (
        <p role="alert" className="bg-danger/10 text-danger rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="bg-success/10 text-success rounded-sm px-3 py-2">
          Póliza registrada.
        </p>
      )}
      <Field id="product_id" label="Producto" error={e("product_id")}>
        <Select
          id="product_id"
          name="product_id"
          defaultValue={v("product_id")}
          invalid={!!e("product_id")}
          aria-describedby={describedBy("product_id", e("product_id"))}
        >
          <option value="">Elige…</option>
          {groups.map((g) => (
            <optgroup key={g.line} label={LINE_LABEL[g.line]}>
              {g.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="annual_premium" label="Prima anual (€)" error={e("annual_premium")} hint={premiumHint}>
          <Input
            id="annual_premium"
            name="annual_premium"
            inputMode="decimal"
            placeholder="245,00"
            defaultValue={v("annual_premium")}
            invalid={!!e("annual_premium")}
            aria-describedby={describedBy("annual_premium", e("annual_premium"), premiumHint)}
          />
        </Field>
        <Field id="effective_date" label="Fecha de efecto" error={e("effective_date")}>
          <Input
            id="effective_date"
            name="effective_date"
            type="date"
            defaultValue={v("effective_date", today)}
            invalid={!!e("effective_date")}
            aria-describedby={describedBy("effective_date", e("effective_date"))}
          />
        </Field>
      </div>
      <Field id="external_ref" label="Referencia en la plataforma" optional error={e("external_ref")}>
        <Input id="external_ref" name="external_ref" maxLength={60} defaultValue={v("external_ref")} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Añadir póliza
        </Button>
      </div>
    </form>
  );
}
