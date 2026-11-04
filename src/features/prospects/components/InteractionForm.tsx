"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Field, Select, Textarea, describedBy } from "@/components/ui";
import { addInteraction } from "../actions";
import { INTERACTION_KINDS, INTERACTION_LABEL, type FormState } from "../schema";

export function InteractionForm({ prospectId }: { prospectId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addInteraction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const e = (k: string) => state.fieldErrors?.[k];
  return (
    <form ref={formRef} action={action} noValidate className="space-y-3">
      <input type="hidden" name="prospect_id" value={prospectId} />
      {state.error && (
        <p role="alert" className="bg-danger/10 text-danger rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}
      <Field id="kind" label="Tipo" error={e("kind")}>
        <Select id="kind" name="kind" defaultValue={state.values?.kind ?? "llamada"}>
          {INTERACTION_KINDS.map((k) => (
            <option key={k} value={k}>
              {INTERACTION_LABEL[k]}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        id="summary"
        label="¿Qué ha pasado?"
        error={e("summary")}
        hint="Breve. Sin datos de salud ni documentos."
      >
        <Textarea
          id="summary"
          name="summary"
          maxLength={1000}
          defaultValue={state.ok ? "" : state.values?.summary}
          invalid={!!e("summary")}
          aria-describedby={describedBy("summary", e("summary"), "Breve. Sin datos de salud ni documentos.")}
          placeholder="Llamada de presentación. Quiere comparar su seguro de hogar."
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Registrar
        </Button>
      </div>
    </form>
  );
}
