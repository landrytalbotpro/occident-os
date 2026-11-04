import type { Metadata } from "next";
import { CheckSquare } from "lucide-react";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Tareas" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Tareas"
        actions={
          <Button disabled title="Disponible en la etapa 3">
            Nueva tarea
          </Button>
        }
      />
      <EmptyState
        icon={CheckSquare}
        title="No hay tareas pendientes"
        text="Seguimientos, llamadas por hacer y recordatorios."
      />
    </>
  );
}
