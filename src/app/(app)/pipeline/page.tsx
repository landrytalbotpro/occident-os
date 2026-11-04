import type { Metadata } from "next";
import { KanbanSquare } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Pipeline" };

export default function Page() {
  return (
    <>
      <PageHeader title="Pipeline" />
      <EmptyState
        icon={KanbanSquare}
        title="El pipeline está vacío"
        text="Nuevo → Contactado → Cita → Propuesta → Ganado / Perdido. En móvil se verá como lista por etapa."
      />
    </>
  );
}
