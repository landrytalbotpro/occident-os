"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";
import { markRenewalHandled } from "../actions";

/** «Contactado»: el vencimiento desaparece hasta el año que viene. */
export function HandledButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      loading={pending}
      aria-label={`Marcar como contactado: ${label}`}
      onClick={() => {
        const fd = new FormData();
        fd.set("id", id);
        start(() => markRenewalHandled(fd));
      }}
    >
      {!pending && <Check className="size-4" aria-hidden />}
      Contactado
    </Button>
  );
}
