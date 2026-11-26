"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { deleteRenewal } from "../actions";
import { currentOccurrence, isDue, parseYMD } from "../occurrence";
import type { RenewalItem } from "../queries";
import { monthLabel } from "../schema";
import { RenewalForm } from "./RenewalForm";

function Status({ r, today }: { r: RenewalItem; today: string }) {
  const t = parseYMD(today);
  const occ = currentOccurrence(r.month, t);
  if (r.handled_year === occ.year) return <Badge tone="success">Llamado ({occ.year})</Badge>;
  if (!isDue(r.month, r.handled_year, t)) return null;
  return (
    <Badge tone="warning">
      {occ.daysUntil <= 0 ? "A llamar · este mes" : `A llamar · ${occ.daysUntil} días`}
    </Badge>
  );
}

export function RenewalRow({
  renewal: r,
  prospectId,
  usedProducts,
  today,
}: {
  renewal: RenewalItem;
  prospectId: string;
  usedProducts: string[];
  today: string;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [pending, start] = useTransition();
  const label = `${r.product} · ${monthLabel(r.month)}`;

  if (mode === "edit") {
    return (
      <li className="py-3">
        <RenewalForm
          prospectId={prospectId}
          renewal={r}
          usedProducts={usedProducts}
          onDone={() => setMode("view")}
        />
      </li>
    );
  }

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-strong font-semibold">{label}</span>
            <Status r={r} today={today} />
          </div>
          {r.note && <p className="text-muted mt-0.5 break-words">{r.note}</p>}
        </div>
        {mode === "view" && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="text-muted hover:text-strong hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-sm"
              aria-label={`Editar ${label}`}
              title="Editar"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setMode("delete")}
              className="text-muted hover:text-danger hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-sm"
              aria-label={`Eliminar ${label}`}
              title="Eliminar"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      {mode === "delete" && (
        <div role="alert" className="bg-danger/10 mt-2 flex flex-wrap items-center gap-2 rounded-sm p-3">
          <span className="text-danger">
            ¿Eliminar el vencimiento <strong>{label}</strong>?
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setMode("view")}
              className="border-border bg-surface-0 text-strong hover:bg-surface-2 inline-flex h-8 items-center rounded-sm border px-3 text-[13px] font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const fd = new FormData();
                fd.set("id", r.id);
                start(() => deleteRenewal(fd));
              }}
              className="bg-danger text-on-brand inline-flex h-8 items-center rounded-sm px-3 text-[13px] font-semibold disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
