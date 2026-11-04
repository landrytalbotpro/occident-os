"use client";

import { useState, useTransition } from "react";
import { setPolicyStatus } from "../actions";

export function PolicyStatusButton({ id, status }: { id: string; status: "emitida" | "anulada" }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const next = status === "emitida" ? "anulada" : "emitida";
  const run = () => {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    start(() => setPolicyStatus(fd));
    setConfirming(false);
  };

  if (status === "anulada") {
    return (
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="text-muted hover:text-strong text-[13px] font-semibold"
      >
        Reactivar
      </button>
    );
  }
  return confirming ? (
    <span className="flex items-center gap-2 text-[13px]">
      <span className="text-danger">¿Anular?</span>
      <button type="button" onClick={run} disabled={pending} className="text-danger font-semibold">
        Sí, anular
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-muted font-semibold">
        No
      </button>
    </span>
  ) : (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      disabled={pending}
      className="text-muted hover:text-danger text-[13px] font-semibold"
    >
      Anular
    </button>
  );
}
