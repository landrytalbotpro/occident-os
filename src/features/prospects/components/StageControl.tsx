"use client";

import { useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui";
import { changeStage } from "../actions";
import { STAGES, STAGE_LABEL, type Stage } from "../schema";

/** Cambio de etapa en un clic (se guarda al elegir). */
export function StageControl({ id, stage }: { id: string; stage: Stage }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  return (
    <form ref={formRef} action={(fd) => start(() => changeStage(fd))} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="stage-control" className="text-strong text-[13px] font-semibold">
        Etapa
      </label>
      <div className="w-44">
        <Select
          id="stage-control"
          name="stage"
          defaultValue={stage}
          disabled={pending}
          onChange={() => formRef.current?.requestSubmit()}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>
      {pending && <Loader2 className="text-muted size-4 animate-spin" aria-label="Guardando" />}
    </form>
  );
}
