"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteProspect } from "../actions";

/** Borrado definitivo con confirmación nombrada (derecho de supresión). */
export function DeleteProspect({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirming(true)}>
        <Trash2 className="size-4" aria-hidden />
        Eliminar
      </Button>
    );
  }
  return (
    <form
      action={deleteProspect}
      className="bg-danger/10 flex flex-wrap items-center gap-2 rounded-sm p-3"
      role="alert"
    >
      <input type="hidden" name="id" value={id} />
      <span className="text-danger">
        ¿Eliminar a <strong>{name}</strong> y todo su historial? No se puede deshacer.
      </span>
      <div className="ml-auto flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
        <button
          type="submit"
          className="bg-danger text-on-brand inline-flex h-8 items-center rounded-sm px-3 text-[13px] font-semibold"
        >
          Eliminar definitivamente
        </button>
      </div>
    </form>
  );
}
