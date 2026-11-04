"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { convertProspect } from "../actions";

export function ConvertProspect({ prospectId, name }: { prospectId: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button onClick={() => setConfirming(true)}>
        <UserCheck className="size-4" aria-hidden />
        Convertir en cliente
      </Button>
    );
  }
  return (
    <form action={convertProspect} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="prospect_id" value={prospectId} />
      <span className="text-body">
        ¿{name} ha firmado? Pasará a <strong>Ganado</strong> y se creará su ficha de cliente.
      </span>
      <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
      <Button type="submit" size="sm">
        Sí, convertir
      </Button>
    </form>
  );
}
