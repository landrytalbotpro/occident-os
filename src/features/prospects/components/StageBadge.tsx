import { Badge } from "@/components/ui";
import { STAGE_LABEL, type Stage } from "../schema";

const TONE: Record<Stage, "neutral" | "info" | "warning" | "success" | "danger"> = {
  nuevo: "neutral",
  contactado: "info",
  cita: "info",
  propuesta: "warning",
  ganado: "success",
  perdido: "danger",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <Badge tone={TONE[stage]}>{STAGE_LABEL[stage]}</Badge>;
}
